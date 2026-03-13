use super::types::AssessmentData;
use super::utils::{communication_needs_score, trial_period_score};

/// A declarative hearing aid assessment concern rule.
pub struct HearingAidRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All hearing aid rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<HearingAidRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        HearingAidRule {
            id: "HA-001",
            category: "Audiometric",
            description: "Severe hearing loss detected (PTA > 70 dB in either ear)",
            concern_level: "high",
            evaluate: |d| {
                d.audiometric_results.right_ear_pta.is_some_and(|v| v > 70)
                    || d.audiometric_results.left_ear_pta.is_some_and(|v| v > 70)
            },
        },
        HearingAidRule {
            id: "HA-002",
            category: "Communication",
            description: "Communication needs score below 40% - significant difficulty",
            concern_level: "high",
            evaluate: |d| communication_needs_score(d).is_some_and(|s| s < 40.0),
        },
        HearingAidRule {
            id: "HA-003",
            category: "Speech Recognition",
            description: "Speech recognition below 50% in either ear",
            concern_level: "high",
            evaluate: |d| {
                d.audiometric_results.speech_recognition_right.is_some_and(|v| v < 50)
                    || d.audiometric_results.speech_recognition_left.is_some_and(|v| v < 50)
            },
        },
        HearingAidRule {
            id: "HA-004",
            category: "Trial",
            description: "Trial period benefit rated Very Poor (1)",
            concern_level: "high",
            evaluate: |d| d.trial_period.reported_benefit == Some(1),
        },
        HearingAidRule {
            id: "HA-005",
            category: "Clinical",
            description: "Aided improvement rated Very Poor (1)",
            concern_level: "high",
            evaluate: |d| d.clinical_review.aided_improvement == Some(1),
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        HearingAidRule {
            id: "HA-006",
            category: "Expectations",
            description: "Unrealistic expectations (rated 1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.expectations_goals.realistic_expectations, Some(1..=2)),
        },
        HearingAidRule {
            id: "HA-007",
            category: "Lifestyle",
            description: "Low motivation level (rated 1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.lifestyle_assessment.motivation_level, Some(1..=2)),
        },
        HearingAidRule {
            id: "HA-008",
            category: "Trial",
            description: "Poor daily wear compliance (rated 1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.trial_period.daily_wear_compliance, Some(1..=2)),
        },
        HearingAidRule {
            id: "HA-009",
            category: "Fitting",
            description: "Poor ear canal suitability (rated 1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.fitting_requirements.ear_canal_suitability, Some(1..=2)),
        },
        HearingAidRule {
            id: "HA-010",
            category: "Current Device",
            description: "Very dissatisfied with current hearing aids (rated 1)",
            concern_level: "medium",
            evaluate: |d| d.current_hearing_aids.satisfaction_with_current == Some(1),
        },
        HearingAidRule {
            id: "HA-011",
            category: "Trial",
            description: "Sound quality rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.trial_period.sound_quality, Some(1..=2)),
        },
        HearingAidRule {
            id: "HA-012",
            category: "Trial",
            description: "Feedback management rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.trial_period.feedback_management, Some(1..=2)),
        },
        HearingAidRule {
            id: "HA-013",
            category: "Expectations",
            description: "Low willingness to adapt (rated 1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.expectations_goals.willingness_to_adapt, Some(1..=2)),
        },
        HearingAidRule {
            id: "HA-014",
            category: "Trial",
            description: "Trial period dimension score below 40%",
            concern_level: "medium",
            evaluate: |d| trial_period_score(d).is_some_and(|s| s < 40.0),
        },
        HearingAidRule {
            id: "HA-015",
            category: "Clinical",
            description: "Low recommendation confidence (rated 1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.clinical_review.recommendation_confidence, Some(1..=2)),
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        HearingAidRule {
            id: "HA-016",
            category: "Clinical",
            description: "Patient satisfaction rated Excellent (5)",
            concern_level: "low",
            evaluate: |d| d.clinical_review.patient_satisfaction == Some(5),
        },
        HearingAidRule {
            id: "HA-017",
            category: "Trial",
            description: "Reported benefit rated Excellent (5)",
            concern_level: "low",
            evaluate: |d| d.trial_period.reported_benefit == Some(5),
        },
        HearingAidRule {
            id: "HA-018",
            category: "Expectations",
            description: "High overall readiness (rated 5)",
            concern_level: "low",
            evaluate: |d| d.expectations_goals.overall_readiness == Some(5),
        },
        HearingAidRule {
            id: "HA-019",
            category: "Clinical",
            description: "Aided improvement rated Excellent (5)",
            concern_level: "low",
            evaluate: |d| d.clinical_review.aided_improvement == Some(5),
        },
        HearingAidRule {
            id: "HA-020",
            category: "Communication",
            description: "All communication needs items rated Good or Excellent (4-5)",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.communication_needs.quiet_conversation,
                    d.communication_needs.group_conversation,
                    d.communication_needs.telephone_use,
                    d.communication_needs.television_listening,
                    d.communication_needs.public_settings,
                    d.communication_needs.workplace_communication,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
    ]
}
