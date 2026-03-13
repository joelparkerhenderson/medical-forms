use super::types::AssessmentData;
use super::utils::{mse_score, risk_score};

/// A declarative psychiatric severity concern rule.
pub struct SeverityRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All severity rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<SeverityRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        SeverityRule {
            id: "PSY-001",
            category: "Risk",
            description: "Active suicidal ideation with plan (rated 5)",
            concern_level: "high",
            evaluate: |d| d.risk_assessment.suicidal_ideation == Some(5),
        },
        SeverityRule {
            id: "PSY-002",
            category: "Risk",
            description: "High self-harm risk (rated 4-5)",
            concern_level: "high",
            evaluate: |d| matches!(d.risk_assessment.self_harm_risk, Some(4..=5)),
        },
        SeverityRule {
            id: "PSY-003",
            category: "Risk",
            description: "Risk of harm to others (rated 4-5)",
            concern_level: "high",
            evaluate: |d| matches!(d.risk_assessment.harm_to_others, Some(4..=5)),
        },
        SeverityRule {
            id: "PSY-004",
            category: "Clinical",
            description: "Overall severity rated crisis level (5)",
            concern_level: "high",
            evaluate: |d| d.clinical_review.overall_severity == Some(5),
        },
        SeverityRule {
            id: "PSY-005",
            category: "MSE",
            description: "Mental state examination score above 80% (severe abnormalities)",
            concern_level: "high",
            evaluate: |d| mse_score(d).is_some_and(|s| s > 80.0),
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        SeverityRule {
            id: "PSY-006",
            category: "Risk",
            description: "Suicidal ideation present without specific plan (rated 3-4)",
            concern_level: "medium",
            evaluate: |d| matches!(d.risk_assessment.suicidal_ideation, Some(3..=4)),
        },
        SeverityRule {
            id: "PSY-007",
            category: "Substance",
            description: "Significant alcohol use concern (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.substance_use.alcohol_use, Some(4..=5)),
        },
        SeverityRule {
            id: "PSY-008",
            category: "Substance",
            description: "Significant drug use concern (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.substance_use.drug_use, Some(4..=5)),
        },
        SeverityRule {
            id: "PSY-009",
            category: "Treatment",
            description: "Poor medication adherence (rated 1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.current_treatment.medication_adherence, Some(1..=2)),
        },
        SeverityRule {
            id: "PSY-010",
            category: "MSE",
            description: "Thought content abnormalities (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.mental_state_examination.thought_content, Some(4..=5)),
        },
        SeverityRule {
            id: "PSY-011",
            category: "MSE",
            description: "Perceptual disturbances present (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.mental_state_examination.perception, Some(4..=5)),
        },
        SeverityRule {
            id: "PSY-012",
            category: "Functional",
            description: "Severely impaired daily functioning (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.social_functional.daily_functioning, Some(4..=5)),
        },
        SeverityRule {
            id: "PSY-013",
            category: "Risk",
            description: "Risk assessment dimension score above 60%",
            concern_level: "medium",
            evaluate: |d| risk_score(d).is_some_and(|s| s > 60.0),
        },
        SeverityRule {
            id: "PSY-014",
            category: "Treatment",
            description: "Significant side effects from medication (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.current_treatment.side_effects_severity, Some(4..=5)),
        },
        SeverityRule {
            id: "PSY-015",
            category: "Clinical",
            description: "Overall severity rated moderate-severe (4)",
            concern_level: "medium",
            evaluate: |d| d.clinical_review.overall_severity == Some(4),
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        SeverityRule {
            id: "PSY-016",
            category: "Treatment",
            description: "Good treatment engagement (therapy rated 4-5)",
            concern_level: "low",
            evaluate: |d| matches!(d.current_treatment.therapy_engagement, Some(4..=5)),
        },
        SeverityRule {
            id: "PSY-017",
            category: "Functional",
            description: "Good social support network (rated 1-2, low concern)",
            concern_level: "low",
            evaluate: |d| matches!(d.social_functional.social_support, Some(1..=2)),
        },
        SeverityRule {
            id: "PSY-018",
            category: "MSE",
            description: "Good insight and judgement (rated 1-2)",
            concern_level: "low",
            evaluate: |d| matches!(d.mental_state_examination.insight_judgement, Some(1..=2)),
        },
        SeverityRule {
            id: "PSY-019",
            category: "Risk",
            description: "Strong protective factors present (rated 1-2, low risk)",
            concern_level: "low",
            evaluate: |d| matches!(d.risk_assessment.protective_factors, Some(1..=2)),
        },
        SeverityRule {
            id: "PSY-020",
            category: "Clinical",
            description: "Positive prognosis outlook (rated 1-2)",
            concern_level: "low",
            evaluate: |d| matches!(d.clinical_review.prognosis_outlook, Some(1..=2)),
        },
    ]
}
