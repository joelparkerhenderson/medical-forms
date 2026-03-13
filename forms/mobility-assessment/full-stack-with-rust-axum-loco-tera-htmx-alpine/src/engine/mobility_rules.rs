use super::types::AssessmentData;
use super::utils::{balance_score, gait_score, transfers_score};

/// A declarative mobility concern rule.
pub struct MobilityRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All mobility rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<MobilityRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        MobilityRule {
            id: "MOB-001",
            category: "Overall",
            description: "Overall mobility rated Dependent (1)",
            concern_level: "high",
            evaluate: |d| d.clinical_review.overall_mobility_rating == Some(1),
        },
        MobilityRule {
            id: "MOB-002",
            category: "Balance",
            description: "Balance dimension score below 20% - severe impairment",
            concern_level: "high",
            evaluate: |d| balance_score(d).is_some_and(|s| s < 20.0),
        },
        MobilityRule {
            id: "MOB-003",
            category: "Falls",
            description: "Two or more falls in past year with high fear of falling",
            concern_level: "high",
            evaluate: |d| {
                d.falls_risk_assessment.falls_in_past_year == "twoOrMore"
                    && matches!(d.falls_risk_assessment.fear_of_falling, Some(1..=2))
            },
        },
        MobilityRule {
            id: "MOB-004",
            category: "Gait",
            description: "Gait dimension score below 20% - unable to ambulate safely",
            concern_level: "high",
            evaluate: |d| gait_score(d).is_some_and(|s| s < 20.0),
        },
        MobilityRule {
            id: "MOB-005",
            category: "Transfers",
            description: "Transfers dimension score below 20% - dependent on transfers",
            concern_level: "high",
            evaluate: |d| transfers_score(d).is_some_and(|s| s < 20.0),
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        MobilityRule {
            id: "MOB-006",
            category: "Balance",
            description: "Static standing balance rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.balance_assessment.static_standing_balance, Some(1..=2)),
        },
        MobilityRule {
            id: "MOB-007",
            category: "Gait",
            description: "Gait pattern quality rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.gait_analysis.gait_pattern_quality, Some(1..=2)),
        },
        MobilityRule {
            id: "MOB-008",
            category: "Transfers",
            description: "Sit-to-stand rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.transfers_bed_mobility.sit_to_stand, Some(1..=2)),
        },
        MobilityRule {
            id: "MOB-009",
            category: "Stairs",
            description: "Stair ascent rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.stairs_obstacles.stair_ascent, Some(1..=2)),
        },
        MobilityRule {
            id: "MOB-010",
            category: "Stairs",
            description: "Stair descent rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.stairs_obstacles.stair_descent, Some(1..=2)),
        },
        MobilityRule {
            id: "MOB-011",
            category: "Falls",
            description: "Two or more falls in past year",
            concern_level: "medium",
            evaluate: |d| d.falls_risk_assessment.falls_in_past_year == "twoOrMore",
        },
        MobilityRule {
            id: "MOB-012",
            category: "Pain",
            description: "Severe pain with movement (rated 1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.mobility_history.pain_with_movement, Some(1..=2)),
        },
        MobilityRule {
            id: "MOB-013",
            category: "Endurance",
            description: "Endurance level rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.mobility_history.endurance_level, Some(1..=2)),
        },
        MobilityRule {
            id: "MOB-014",
            category: "Upper Limb",
            description: "Grip strength rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.upper_limb_function.grip_strength, Some(1..=2)),
        },
        MobilityRule {
            id: "MOB-015",
            category: "Overall",
            description: "Overall mobility rated Maximal Assistance (2)",
            concern_level: "medium",
            evaluate: |d| d.clinical_review.overall_mobility_rating == Some(2),
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        MobilityRule {
            id: "MOB-016",
            category: "Overall",
            description: "Overall mobility rated Independent (5)",
            concern_level: "low",
            evaluate: |d| d.clinical_review.overall_mobility_rating == Some(5),
        },
        MobilityRule {
            id: "MOB-017",
            category: "Balance",
            description: "All balance items rated Good or Excellent (4-5)",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.balance_assessment.static_sitting_balance,
                    d.balance_assessment.dynamic_sitting_balance,
                    d.balance_assessment.static_standing_balance,
                    d.balance_assessment.dynamic_standing_balance,
                    d.balance_assessment.single_leg_stance,
                    d.balance_assessment.tandem_stance,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
        MobilityRule {
            id: "MOB-018",
            category: "Gait",
            description: "All gait items rated Good or Excellent (4-5)",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.gait_analysis.gait_pattern_quality,
                    d.gait_analysis.gait_speed,
                    d.gait_analysis.step_length_symmetry,
                    d.gait_analysis.turning_ability,
                    d.gait_analysis.outdoor_walking,
                    d.gait_analysis.walking_endurance,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
        MobilityRule {
            id: "MOB-019",
            category: "Rehabilitation",
            description: "High rehabilitation potential (rated 5)",
            concern_level: "low",
            evaluate: |d| d.clinical_review.rehabilitation_potential == Some(5),
        },
        MobilityRule {
            id: "MOB-020",
            category: "Falls",
            description: "No falls in past year and low fear of falling (4-5)",
            concern_level: "low",
            evaluate: |d| {
                d.falls_risk_assessment.falls_in_past_year == "none"
                    && matches!(d.falls_risk_assessment.fear_of_falling, Some(4..=5))
            },
        },
    ]
}
