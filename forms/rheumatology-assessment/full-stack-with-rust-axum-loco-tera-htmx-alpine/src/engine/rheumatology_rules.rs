use super::types::AssessmentData;
use super::utils::{disease_activity_score, joint_score, functional_status_score};

/// A declarative rheumatology concern rule.
pub struct RheumatologyRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All rheumatology rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<RheumatologyRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        RheumatologyRule {
            id: "RHEUM-001",
            category: "Disease Activity",
            description: "DAS28 score indicates high disease activity (>5.1)",
            concern_level: "high",
            evaluate: |d| d.disease_activity.das28_score.is_some_and(|s| s > 5.1),
        },
        RheumatologyRule {
            id: "RHEUM-002",
            category: "Joint",
            description: "Swollen joint count 8 or more - significant polyarthritis",
            concern_level: "high",
            evaluate: |d| d.joint_assessment.swollen_joint_count.is_some_and(|c| c >= 8),
        },
        RheumatologyRule {
            id: "RHEUM-003",
            category: "Functional",
            description: "Functional status dimension score above 70% - severe disability",
            concern_level: "high",
            evaluate: |d| functional_status_score(d).is_some_and(|s| s > 70.0),
        },
        RheumatologyRule {
            id: "RHEUM-004",
            category: "Disease Activity",
            description: "Patient global assessment very high (9-10) - severe disease burden",
            concern_level: "high",
            evaluate: |d| matches!(d.disease_activity.patient_global_assessment, Some(9..=10)),
        },
        RheumatologyRule {
            id: "RHEUM-005",
            category: "Imaging",
            description: "Imaging progression since last assessment with erosions present",
            concern_level: "high",
            evaluate: |d| {
                d.imaging_findings.imaging_progression_since_last == "yes"
                    && d.imaging_findings.xray_erosions_present == "yes"
            },
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        RheumatologyRule {
            id: "RHEUM-006",
            category: "Morning Stiffness",
            description: "Morning stiffness lasting 60 minutes or more",
            concern_level: "medium",
            evaluate: |d| d.morning_stiffness.stiffness_duration_minutes.is_some_and(|m| m >= 60),
        },
        RheumatologyRule {
            id: "RHEUM-007",
            category: "Laboratory",
            description: "Elevated ESR (above 30 mm/hr) indicating active inflammation",
            concern_level: "medium",
            evaluate: |d| d.laboratory_markers.esr_value.is_some_and(|v| v > 30.0),
        },
        RheumatologyRule {
            id: "RHEUM-008",
            category: "Laboratory",
            description: "Elevated CRP (above 10 mg/L) indicating active inflammation",
            concern_level: "medium",
            evaluate: |d| d.laboratory_markers.crp_value.is_some_and(|v| v > 10.0),
        },
        RheumatologyRule {
            id: "RHEUM-009",
            category: "Medication",
            description: "Poor medication adherence (rated 1-3 out of 10)",
            concern_level: "medium",
            evaluate: |d| matches!(d.medication_history.medication_adherence, Some(1..=3)),
        },
        RheumatologyRule {
            id: "RHEUM-010",
            category: "Disease Activity",
            description: "Pain VAS score high (7-8) - significant pain burden",
            concern_level: "medium",
            evaluate: |d| matches!(d.disease_activity.pain_vas_score, Some(7..=8)),
        },
        RheumatologyRule {
            id: "RHEUM-011",
            category: "Joint",
            description: "Joint deformity present - structural damage",
            concern_level: "medium",
            evaluate: |d| d.joint_assessment.joint_deformity_present == "yes",
        },
        RheumatologyRule {
            id: "RHEUM-012",
            category: "Comorbidity",
            description: "Interstitial lung disease reported - extra-articular complication",
            concern_level: "medium",
            evaluate: |d| d.comorbidities.interstitial_lung_disease == "yes",
        },
        RheumatologyRule {
            id: "RHEUM-013",
            category: "Disease Activity",
            description: "Frequent flares reported",
            concern_level: "medium",
            evaluate: |d| d.disease_activity.flare_frequency == "frequent",
        },
        RheumatologyRule {
            id: "RHEUM-014",
            category: "Joint",
            description: "Joint assessment dimension score above 50% - moderate joint involvement",
            concern_level: "medium",
            evaluate: |d| joint_score(d).is_some_and(|s| s > 50.0),
        },
        RheumatologyRule {
            id: "RHEUM-015",
            category: "Medication",
            description: "Adverse effects reported from current therapy",
            concern_level: "medium",
            evaluate: |d| d.medication_history.adverse_effects_reported == "yes",
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        RheumatologyRule {
            id: "RHEUM-016",
            category: "Disease Activity",
            description: "DAS28 score indicates remission (<2.6)",
            concern_level: "low",
            evaluate: |d| d.disease_activity.das28_score.is_some_and(|s| s < 2.6),
        },
        RheumatologyRule {
            id: "RHEUM-017",
            category: "Clinical Review",
            description: "Treatment goal met - good disease control",
            concern_level: "low",
            evaluate: |d| d.clinical_review.treatment_goal_met == "yes",
        },
        RheumatologyRule {
            id: "RHEUM-018",
            category: "Disease Activity",
            description: "Patient global assessment low (1-2) - minimal disease impact",
            concern_level: "low",
            evaluate: |d| matches!(d.disease_activity.patient_global_assessment, Some(1..=2)),
        },
        RheumatologyRule {
            id: "RHEUM-019",
            category: "Disease Activity",
            description: "Disease activity dimension score below 20% - well controlled",
            concern_level: "low",
            evaluate: |d| disease_activity_score(d).is_some_and(|s| s < 20.0),
        },
        RheumatologyRule {
            id: "RHEUM-020",
            category: "Clinical Review",
            description: "Good treatment response (rated 8-10)",
            concern_level: "low",
            evaluate: |d| matches!(d.clinical_review.treatment_response, Some(8..=10)),
        },
    ]
}
