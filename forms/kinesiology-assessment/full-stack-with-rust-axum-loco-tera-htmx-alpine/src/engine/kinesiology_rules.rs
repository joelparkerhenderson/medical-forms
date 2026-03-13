use super::types::AssessmentData;
use super::utils::{muscle_strength_score, postural_score, range_of_motion_score, functional_testing_score, gait_score};

/// A declarative kinesiology concern rule.
pub struct KinesiologyRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All kinesiology rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<KinesiologyRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        KinesiologyRule {
            id: "KIN-001",
            category: "Functional Status",
            description: "Overall functional status rated Very Poor (1)",
            concern_level: "high",
            evaluate: |d| d.clinical_review.overall_functional_status == Some(1),
        },
        KinesiologyRule {
            id: "KIN-002",
            category: "Pain",
            description: "Pain severity rated Extreme (5) - urgent pain management needed",
            concern_level: "high",
            evaluate: |d| d.pain_assessment.pain_severity == Some(5),
        },
        KinesiologyRule {
            id: "KIN-003",
            category: "Muscle Strength",
            description: "Muscle strength dimension score below 25%",
            concern_level: "high",
            evaluate: |d| muscle_strength_score(d).is_some_and(|s| s < 25.0),
        },
        KinesiologyRule {
            id: "KIN-004",
            category: "Range of Motion",
            description: "Range of motion dimension score below 25%",
            concern_level: "high",
            evaluate: |d| range_of_motion_score(d).is_some_and(|s| s < 25.0),
        },
        KinesiologyRule {
            id: "KIN-005",
            category: "Gait",
            description: "Balance during gait rated Very Poor (1) - fall risk",
            concern_level: "high",
            evaluate: |d| d.gait_analysis.balance_during_gait == Some(1),
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        KinesiologyRule {
            id: "KIN-006",
            category: "Posture",
            description: "Postural assessment dimension score below 40%",
            concern_level: "medium",
            evaluate: |d| postural_score(d).is_some_and(|s| s < 40.0),
        },
        KinesiologyRule {
            id: "KIN-007",
            category: "Functional Testing",
            description: "Functional testing dimension score below 40%",
            concern_level: "medium",
            evaluate: |d| functional_testing_score(d).is_some_and(|s| s < 40.0),
        },
        KinesiologyRule {
            id: "KIN-008",
            category: "Pain",
            description: "Pain with movement rated Severe (4) or Extreme (5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.pain_assessment.pain_with_movement, Some(4..=5)),
        },
        KinesiologyRule {
            id: "KIN-009",
            category: "Gait",
            description: "Gait dimension score below 40%",
            concern_level: "medium",
            evaluate: |d| gait_score(d).is_some_and(|s| s < 40.0),
        },
        KinesiologyRule {
            id: "KIN-010",
            category: "Muscle Strength",
            description: "Core stability rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.muscle_strength_testing.core_stability, Some(1..=2)),
        },
        KinesiologyRule {
            id: "KIN-011",
            category: "Range of Motion",
            description: "Cervical flexion rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.range_of_motion.cervical_flexion, Some(1..=2)),
        },
        KinesiologyRule {
            id: "KIN-012",
            category: "Functional Testing",
            description: "Single leg balance rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.functional_testing.single_leg_balance, Some(1..=2)),
        },
        KinesiologyRule {
            id: "KIN-013",
            category: "Exercise",
            description: "Exercise tolerance rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.exercise_prescription.exercise_tolerance, Some(1..=2)),
        },
        KinesiologyRule {
            id: "KIN-014",
            category: "Movement History",
            description: "Daily activity limitation rated Severe (4) or Extreme (5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.movement_history.daily_activity_limitation, Some(4..=5)),
        },
        KinesiologyRule {
            id: "KIN-015",
            category: "Posture",
            description: "Spinal curvature rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.postural_assessment.spinal_curvature, Some(1..=2)),
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        KinesiologyRule {
            id: "KIN-016",
            category: "Functional Status",
            description: "Overall functional status rated Excellent (5)",
            concern_level: "low",
            evaluate: |d| d.clinical_review.overall_functional_status == Some(5),
        },
        KinesiologyRule {
            id: "KIN-017",
            category: "Muscle Strength",
            description: "All muscle strength items rated Good or Excellent (4-5)",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.muscle_strength_testing.upper_extremity_strength,
                    d.muscle_strength_testing.lower_extremity_strength,
                    d.muscle_strength_testing.core_stability,
                    d.muscle_strength_testing.grip_strength,
                    d.muscle_strength_testing.bilateral_symmetry,
                    d.muscle_strength_testing.muscle_endurance,
                    d.muscle_strength_testing.functional_strength,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
        KinesiologyRule {
            id: "KIN-018",
            category: "Pain",
            description: "Pain severity rated Minimal (1) - minimal pain",
            concern_level: "low",
            evaluate: |d| d.pain_assessment.pain_severity == Some(1),
        },
        KinesiologyRule {
            id: "KIN-019",
            category: "Exercise",
            description: "Motivation level rated Excellent (5)",
            concern_level: "low",
            evaluate: |d| d.exercise_prescription.motivation_level == Some(5),
        },
        KinesiologyRule {
            id: "KIN-020",
            category: "Prognosis",
            description: "Prognosis rated Excellent (5)",
            concern_level: "low",
            evaluate: |d| d.clinical_review.prognosis_rating == Some(5),
        },
    ]
}
