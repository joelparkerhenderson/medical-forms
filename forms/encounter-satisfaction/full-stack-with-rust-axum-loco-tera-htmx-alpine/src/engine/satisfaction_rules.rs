use super::types::AssessmentData;
use super::utils::{care_quality_score, communication_score};

/// A declarative satisfaction concern rule.
pub struct SatisfactionRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All satisfaction rules, ordered by concern level (high → medium → low).
pub fn all_rules() -> Vec<SatisfactionRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        SatisfactionRule {
            id: "SR-001",
            category: "Overall",
            description: "Overall satisfaction rated Very Dissatisfied (1)",
            concern_level: "high",
            evaluate: |d| d.overall_experience.overall_satisfaction == Some(1),
        },
        SatisfactionRule {
            id: "SR-002",
            category: "NPS",
            description: "NPS detractor (0-3) - very unlikely to recommend",
            concern_level: "high",
            evaluate: |d| matches!(d.overall_experience.likelihood_to_recommend, Some(0..=3)),
        },
        SatisfactionRule {
            id: "SR-003",
            category: "Communication",
            description: "Communication dimension score below 40%",
            concern_level: "high",
            evaluate: |d| communication_score(d).is_some_and(|s| s < 40.0),
        },
        SatisfactionRule {
            id: "SR-004",
            category: "Care Quality",
            description: "Care quality dimension score below 40%",
            concern_level: "high",
            evaluate: |d| care_quality_score(d).is_some_and(|s| s < 40.0),
        },
        SatisfactionRule {
            id: "SR-005",
            category: "Medication",
            description: "Pain management rated Very Poor (1)",
            concern_level: "high",
            evaluate: |d| d.medication_treatment.pain_management == Some(1),
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        SatisfactionRule {
            id: "SR-006",
            category: "Wait Time",
            description: "Wait time acceptability rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.wait_time_access.wait_time_acceptability, Some(1..=2)),
        },
        SatisfactionRule {
            id: "SR-007",
            category: "Environment",
            description: "Facility cleanliness rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.environment.facility_cleanliness, Some(1..=2)),
        },
        SatisfactionRule {
            id: "SR-008",
            category: "Environment",
            description: "Privacy adequacy rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.environment.privacy_adequacy, Some(1..=2)),
        },
        SatisfactionRule {
            id: "SR-009",
            category: "Staff",
            description: "Staff professionalism rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.staff_interaction.staff_professionalism, Some(1..=2)),
        },
        SatisfactionRule {
            id: "SR-010",
            category: "Discharge",
            description: "Discharge instructions unclear (rated 1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.discharge_follow_up.discharge_instruction_clarity, Some(1..=2)),
        },
        SatisfactionRule {
            id: "SR-011",
            category: "NPS",
            description: "NPS passive (4-6) - unlikely to recommend",
            concern_level: "medium",
            evaluate: |d| matches!(d.overall_experience.likelihood_to_recommend, Some(4..=6)),
        },
        SatisfactionRule {
            id: "SR-012",
            category: "Medication",
            description: "Side effects not explained (rated 1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.medication_treatment.side_effects_explained, Some(1..=2)),
        },
        SatisfactionRule {
            id: "SR-013",
            category: "Overall",
            description: "Overall satisfaction rated Dissatisfied (2)",
            concern_level: "medium",
            evaluate: |d| d.overall_experience.overall_satisfaction == Some(2),
        },
        SatisfactionRule {
            id: "SR-014",
            category: "Communication",
            description: "Provider time adequacy rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.communication.provider_time_adequacy, Some(1..=2)),
        },
        SatisfactionRule {
            id: "SR-015",
            category: "Staff",
            description: "Reception courtesy rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.staff_interaction.reception_courtesy, Some(1..=2)),
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        SatisfactionRule {
            id: "SR-016",
            category: "NPS",
            description: "NPS promoter (9-10) - highly likely to recommend",
            concern_level: "low",
            evaluate: |d| matches!(d.overall_experience.likelihood_to_recommend, Some(9..=10)),
        },
        SatisfactionRule {
            id: "SR-017",
            category: "Overall",
            description: "Overall satisfaction rated Very Satisfied (5)",
            concern_level: "low",
            evaluate: |d| d.overall_experience.overall_satisfaction == Some(5),
        },
        SatisfactionRule {
            id: "SR-018",
            category: "Overall",
            description: "Would return for care (rated 5)",
            concern_level: "low",
            evaluate: |d| d.overall_experience.would_return_for_care == Some(5),
        },
        SatisfactionRule {
            id: "SR-019",
            category: "Communication",
            description: "All communication items rated Good or Excellent (4-5)",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.communication.provider_listening,
                    d.communication.provider_explaining,
                    d.communication.provider_respect,
                    d.communication.provider_time_adequacy,
                    d.communication.questions_encouraged,
                    d.communication.information_clarity,
                    d.communication.shared_decision_making,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
        SatisfactionRule {
            id: "SR-020",
            category: "Overall",
            description: "Expectations exceeded (rated 5)",
            concern_level: "low",
            evaluate: |d| d.overall_experience.met_expectations == Some(5),
        },
    ]
}
