use super::types::AssessmentData;
use super::utils::{sensory_score, social_communication_score, repetitive_behaviours_score};

/// A declarative autism likelihood concern rule.
pub struct LikelihoodRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All 20 likelihood rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<LikelihoodRule> {
    vec![
        // ─── HIGH CONCERN (ASD-001 to ASD-005) ──────────────────
        LikelihoodRule {
            id: "ASD-001",
            category: "AQ-10",
            description: "AQ-10 score >= 8 - strong indication for referral",
            concern_level: "high",
            evaluate: |d| {
                let score = super::utils::calculate_aq10_score(&d.aq10_screening);
                matches!(score, Some(8..=10))
            },
        },
        LikelihoodRule {
            id: "ASD-002",
            category: "Sensory",
            description: "Severe sensory overload - daily sensory overload reported",
            concern_level: "high",
            evaluate: |d| d.sensory_processing.sensory_overload_frequency == "daily",
        },
        LikelihoodRule {
            id: "ASD-003",
            category: "Communication",
            description: "Communication breakdown - social communication score above 80%",
            concern_level: "high",
            evaluate: |d| social_communication_score(d).is_some_and(|s| s > 80.0),
        },
        LikelihoodRule {
            id: "ASD-004",
            category: "Safety",
            description: "Self-harm risk identified - immediate safety assessment needed",
            concern_level: "high",
            evaluate: |d| d.mental_health_comorbidities.self_harm_risk == "yes",
        },
        LikelihoodRule {
            id: "ASD-005",
            category: "Safeguarding",
            description: "Safeguarding concern identified - immediate action required",
            concern_level: "high",
            evaluate: |d| d.mental_health_comorbidities.safeguarding_concerns == "yes",
        },

        // ─── MEDIUM CONCERN (ASD-006 to ASD-015) ────────────────
        LikelihoodRule {
            id: "ASD-006",
            category: "AQ-10",
            description: "AQ-10 score 6-7 - referral recommended",
            concern_level: "medium",
            evaluate: |d| {
                let score = super::utils::calculate_aq10_score(&d.aq10_screening);
                matches!(score, Some(6..=7))
            },
        },
        LikelihoodRule {
            id: "ASD-007",
            category: "Social",
            description: "Social communication difficulties above 60%",
            concern_level: "medium",
            evaluate: |d| social_communication_score(d).is_some_and(|s| s > 60.0 && s <= 80.0),
        },
        LikelihoodRule {
            id: "ASD-008",
            category: "Behaviours",
            description: "Restricted/repetitive behaviours above 60%",
            concern_level: "medium",
            evaluate: |d| repetitive_behaviours_score(d).is_some_and(|s| s > 60.0),
        },
        LikelihoodRule {
            id: "ASD-009",
            category: "Sensory",
            description: "Sensory processing score above 60%",
            concern_level: "medium",
            evaluate: |d| sensory_score(d).is_some_and(|s| s > 60.0),
        },
        LikelihoodRule {
            id: "ASD-010",
            category: "Mental Health",
            description: "High anxiety level (rated 3) - comorbid anxiety assessment needed",
            concern_level: "medium",
            evaluate: |d| d.mental_health_comorbidities.anxiety_level == Some(3),
        },
        LikelihoodRule {
            id: "ASD-011",
            category: "Mental Health",
            description: "High depression level (rated 3) - comorbid depression assessment needed",
            concern_level: "medium",
            evaluate: |d| d.mental_health_comorbidities.depression_level == Some(3),
        },
        LikelihoodRule {
            id: "ASD-012",
            category: "Daily Living",
            description: "Significant daily living skill difficulties - multiple areas rated 3",
            concern_level: "medium",
            evaluate: |d| {
                let items = [
                    d.daily_living_skills.personal_care,
                    d.daily_living_skills.meal_preparation,
                    d.daily_living_skills.time_management,
                    d.daily_living_skills.financial_management,
                    d.daily_living_skills.travel_independence,
                ];
                let high_count = items.iter().filter(|&&v| v == Some(3)).count();
                high_count >= 3
            },
        },
        LikelihoodRule {
            id: "ASD-013",
            category: "Development",
            description: "Early developmental delays reported in speech and motor areas",
            concern_level: "medium",
            evaluate: |d| {
                d.developmental_history.speech_delay == "yes"
                    && d.developmental_history.motor_delay == "yes"
            },
        },
        LikelihoodRule {
            id: "ASD-014",
            category: "Sensory",
            description: "Weekly sensory overload reported",
            concern_level: "medium",
            evaluate: |d| d.sensory_processing.sensory_overload_frequency == "weekly",
        },
        LikelihoodRule {
            id: "ASD-015",
            category: "Sleep",
            description: "Severe sleep difficulties (rated 3)",
            concern_level: "medium",
            evaluate: |d| d.mental_health_comorbidities.sleep_difficulties == Some(3),
        },

        // ─── LOW CONCERN (ASD-016 to ASD-020) ───────────────────
        LikelihoodRule {
            id: "ASD-016",
            category: "AQ-10",
            description: "AQ-10 score below threshold (0-5) - referral unlikely needed",
            concern_level: "low",
            evaluate: |d| {
                let score = super::utils::calculate_aq10_score(&d.aq10_screening);
                matches!(score, Some(0..=5))
            },
        },
        LikelihoodRule {
            id: "ASD-017",
            category: "Social",
            description: "Social communication within typical range (below 30%)",
            concern_level: "low",
            evaluate: |d| social_communication_score(d).is_some_and(|s| s < 30.0),
        },
        LikelihoodRule {
            id: "ASD-018",
            category: "Sensory",
            description: "Sensory processing within typical range (below 30%)",
            concern_level: "low",
            evaluate: |d| sensory_score(d).is_some_and(|s| s < 30.0),
        },
        LikelihoodRule {
            id: "ASD-019",
            category: "Behaviours",
            description: "Restricted/repetitive behaviours within typical range (below 30%)",
            concern_level: "low",
            evaluate: |d| repetitive_behaviours_score(d).is_some_and(|s| s < 30.0),
        },
        LikelihoodRule {
            id: "ASD-020",
            category: "Development",
            description: "No early developmental concerns reported",
            concern_level: "low",
            evaluate: |d| {
                d.developmental_history.speech_delay == "no"
                    && d.developmental_history.motor_delay == "no"
                    && d.developmental_history.social_play_differences == "no"
                    && d.developmental_history.early_repetitive_behaviours == "no"
            },
        },
    ]
}
