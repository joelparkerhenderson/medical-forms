use super::types::AssessmentData;
use super::utils::{adl_score, iadl_score, cognitive_score, motor_score};

/// A declarative occupational therapy concern rule.
pub struct OtRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All OT rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<OtRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        OtRule {
            id: "OT-001",
            category: "Safety",
            description: "Safety awareness rated Very Poor (1) - immediate safety risk",
            concern_level: "high",
            evaluate: |d| d.cognitive_perceptual.safety_awareness == Some(1),
        },
        OtRule {
            id: "OT-002",
            category: "ADL",
            description: "ADL dimension score below 25% - severe functional limitation",
            concern_level: "high",
            evaluate: |d| adl_score(d).is_some_and(|s| s < 25.0),
        },
        OtRule {
            id: "OT-003",
            category: "Cognitive",
            description: "Cognitive dimension score below 25% - significant cognitive impairment",
            concern_level: "high",
            evaluate: |d| cognitive_score(d).is_some_and(|s| s < 25.0),
        },
        OtRule {
            id: "OT-004",
            category: "Transfers",
            description: "Transfers rated Very Poor (1) - high fall risk",
            concern_level: "high",
            evaluate: |d| d.daily_living_activities.transfers == Some(1),
        },
        OtRule {
            id: "OT-005",
            category: "Motor",
            description: "Balance rated Very Poor (1) - significant fall risk",
            concern_level: "high",
            evaluate: |d| d.motor_sensory.balance == Some(1),
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        OtRule {
            id: "OT-006",
            category: "ADL",
            description: "ADL dimension score below 50% - moderate functional limitation",
            concern_level: "medium",
            evaluate: |d| adl_score(d).is_some_and(|s| s >= 25.0 && s < 50.0),
        },
        OtRule {
            id: "OT-007",
            category: "IADL",
            description: "IADL dimension score below 40% - needs significant IADL support",
            concern_level: "medium",
            evaluate: |d| iadl_score(d).is_some_and(|s| s < 40.0),
        },
        OtRule {
            id: "OT-008",
            category: "Motor",
            description: "Motor dimension score below 40% - significant motor impairment",
            concern_level: "medium",
            evaluate: |d| motor_score(d).is_some_and(|s| s < 40.0),
        },
        OtRule {
            id: "OT-009",
            category: "Cognitive",
            description: "Memory rated Poor or Very Poor (1-2) - memory impairment concern",
            concern_level: "medium",
            evaluate: |d| matches!(d.cognitive_perceptual.memory, Some(1..=2)),
        },
        OtRule {
            id: "OT-010",
            category: "Home",
            description: "Fall risk factors rated Poor or Very Poor (1-2) - environmental hazards",
            concern_level: "medium",
            evaluate: |d| matches!(d.home_environment.fall_risk_factors, Some(1..=2)),
        },
        OtRule {
            id: "OT-011",
            category: "ADL",
            description: "Bathing rated Poor or Very Poor (1-2) - bathing assistance needed",
            concern_level: "medium",
            evaluate: |d| matches!(d.daily_living_activities.bathing, Some(1..=2)),
        },
        OtRule {
            id: "OT-012",
            category: "IADL",
            description: "Medication management rated Poor or Very Poor (1-2) - medication safety risk",
            concern_level: "medium",
            evaluate: |d| matches!(d.instrumental_activities.medication_management, Some(1..=2)),
        },
        OtRule {
            id: "OT-013",
            category: "Clinical",
            description: "Pain level rated high (4-5) - pain management review needed",
            concern_level: "medium",
            evaluate: |d| matches!(d.clinical_review.pain_level, Some(4..=5)),
        },
        OtRule {
            id: "OT-014",
            category: "Motor",
            description: "Fine motor coordination rated Poor or Very Poor (1-2) - fine motor deficit",
            concern_level: "medium",
            evaluate: |d| matches!(d.motor_sensory.fine_motor_coordination, Some(1..=2)),
        },
        OtRule {
            id: "OT-015",
            category: "Clinical",
            description: "Emotional status rated Poor or Very Poor (1-2) - psychological support needed",
            concern_level: "medium",
            evaluate: |d| matches!(d.clinical_review.emotional_status, Some(1..=2)),
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        OtRule {
            id: "OT-016",
            category: "ADL",
            description: "All ADL items rated Good or Excellent (4-5) - high ADL independence",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.daily_living_activities.feeding,
                    d.daily_living_activities.bathing,
                    d.daily_living_activities.dressing_upper,
                    d.daily_living_activities.dressing_lower,
                    d.daily_living_activities.grooming,
                    d.daily_living_activities.toileting,
                    d.daily_living_activities.transfers,
                    d.daily_living_activities.mobility,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
        OtRule {
            id: "OT-017",
            category: "Cognitive",
            description: "All cognitive items rated Good or Excellent (4-5) - intact cognition",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.cognitive_perceptual.orientation,
                    d.cognitive_perceptual.attention,
                    d.cognitive_perceptual.memory,
                    d.cognitive_perceptual.problem_solving,
                    d.cognitive_perceptual.safety_awareness,
                    d.cognitive_perceptual.visual_perception,
                    d.cognitive_perceptual.sequencing,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
        OtRule {
            id: "OT-018",
            category: "Motivation",
            description: "Motivation level rated Excellent (5) - highly motivated patient",
            concern_level: "low",
            evaluate: |d| d.goals_priorities.motivation_level == Some(5),
        },
        OtRule {
            id: "OT-019",
            category: "Motor",
            description: "All motor items rated Good or Excellent (4-5) - good motor function",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.motor_sensory.upper_extremity_strength,
                    d.motor_sensory.lower_extremity_strength,
                    d.motor_sensory.range_of_motion,
                    d.motor_sensory.fine_motor_coordination,
                    d.motor_sensory.gross_motor_coordination,
                    d.motor_sensory.balance,
                    d.motor_sensory.sensation,
                    d.motor_sensory.endurance,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
        OtRule {
            id: "OT-020",
            category: "Home",
            description: "All home environment items rated Good or Excellent (4-5) - safe home environment",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.home_environment.home_accessibility,
                    d.home_environment.bathroom_safety,
                    d.home_environment.kitchen_safety,
                    d.home_environment.fall_risk_factors,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
    ]
}
