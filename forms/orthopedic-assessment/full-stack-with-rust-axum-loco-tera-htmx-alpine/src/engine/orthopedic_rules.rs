use super::types::AssessmentData;
use super::utils::{pain_score, joint_score, functional_score};

/// A declarative orthopedic concern rule.
pub struct OrthopedicRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All orthopedic rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<OrthopedicRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        OrthopedicRule {
            id: "ORTH-001",
            category: "Pain",
            description: "Pain severity rated maximum (5) - acute pain crisis",
            concern_level: "high",
            evaluate: |d| d.pain_assessment.pain_severity == Some(5),
        },
        OrthopedicRule {
            id: "ORTH-002",
            category: "Joint",
            description: "Joint stability rated critical (5) - gross instability",
            concern_level: "high",
            evaluate: |d| d.joint_examination.joint_stability == Some(5),
        },
        OrthopedicRule {
            id: "ORTH-003",
            category: "Spine",
            description: "Neurological deficit present - urgent evaluation required",
            concern_level: "high",
            evaluate: |d| d.spinal_assessment.neurological_deficit == "yes",
        },
        OrthopedicRule {
            id: "ORTH-004",
            category: "Clinical",
            description: "Red flag symptoms identified - immediate investigation needed",
            concern_level: "high",
            evaluate: |d| d.clinical_review.red_flag_symptoms == "yes",
        },
        OrthopedicRule {
            id: "ORTH-005",
            category: "Pain",
            description: "Pain dimension score above 80% - severe pain burden",
            concern_level: "high",
            evaluate: |d| pain_score(d).is_some_and(|s| s > 80.0),
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        OrthopedicRule {
            id: "ORTH-006",
            category: "Pain",
            description: "Night pain rated high (4-5) - possible inflammatory or serious pathology",
            concern_level: "medium",
            evaluate: |d| matches!(d.pain_assessment.night_pain, Some(4..=5)),
        },
        OrthopedicRule {
            id: "ORTH-007",
            category: "Joint",
            description: "Significant joint swelling (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.joint_examination.joint_swelling, Some(4..=5)),
        },
        OrthopedicRule {
            id: "ORTH-008",
            category: "Joint",
            description: "Joint deformity present",
            concern_level: "medium",
            evaluate: |d| d.joint_examination.joint_deformity == "yes",
        },
        OrthopedicRule {
            id: "ORTH-009",
            category: "Muscle",
            description: "Significant muscle atrophy (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.muscle_assessment.muscle_atrophy, Some(4..=5)),
        },
        OrthopedicRule {
            id: "ORTH-010",
            category: "Spine",
            description: "Nerve root signs present - consider advanced imaging",
            concern_level: "medium",
            evaluate: |d| d.spinal_assessment.nerve_root_signs == "yes",
        },
        OrthopedicRule {
            id: "ORTH-011",
            category: "Functional",
            description: "Functional status score above 70% - significant impairment",
            concern_level: "medium",
            evaluate: |d| functional_score(d).is_some_and(|s| s > 70.0),
        },
        OrthopedicRule {
            id: "ORTH-012",
            category: "Joint",
            description: "Joint dimension score above 70% - significant joint pathology",
            concern_level: "medium",
            evaluate: |d| joint_score(d).is_some_and(|s| s > 70.0),
        },
        OrthopedicRule {
            id: "ORTH-013",
            category: "Muscle",
            description: "Muscle strength rated poor (4-5) - weakness concern",
            concern_level: "medium",
            evaluate: |d| matches!(d.muscle_assessment.muscle_strength, Some(4..=5)),
        },
        OrthopedicRule {
            id: "ORTH-014",
            category: "Functional",
            description: "High fall risk (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.functional_status.fall_risk, Some(4..=5)),
        },
        OrthopedicRule {
            id: "ORTH-015",
            category: "Surgical",
            description: "Conservative options exhausted - surgical pathway indicated",
            concern_level: "medium",
            evaluate: |d| d.surgical_considerations.conservative_options_exhausted == "yes",
        },
        // ─── LOW CONCERN ────────────────────────────────────────
        OrthopedicRule {
            id: "ORTH-016",
            category: "Pain",
            description: "Pain severity minimal (1) - good pain control",
            concern_level: "low",
            evaluate: |d| d.pain_assessment.pain_severity == Some(1),
        },
        OrthopedicRule {
            id: "ORTH-017",
            category: "Functional",
            description: "Good mobility level (rated 1-2) - functional independence maintained",
            concern_level: "low",
            evaluate: |d| matches!(d.functional_status.mobility_level, Some(1..=2)),
        },
        OrthopedicRule {
            id: "ORTH-018",
            category: "Joint",
            description: "Full range of motion preserved (rated 1)",
            concern_level: "low",
            evaluate: |d| d.joint_examination.range_of_motion == Some(1),
        },
        OrthopedicRule {
            id: "ORTH-019",
            category: "Clinical",
            description: "Good patient understanding of condition (rated 1-2)",
            concern_level: "low",
            evaluate: |d| matches!(d.clinical_review.patient_understanding, Some(1..=2)),
        },
        OrthopedicRule {
            id: "ORTH-020",
            category: "Clinical",
            description: "Overall severity rated mild (1-2)",
            concern_level: "low",
            evaluate: |d| matches!(d.clinical_review.overall_severity, Some(1..=2)),
        },
    ]
}
