use super::types::AssessmentData;
use super::utils::{calculate_pta, has_air_bone_gap, pta_asymmetry, tinnitus_impact_score, communication_impact_score};

/// A declarative hearing assessment rule.
pub struct HearingRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All hearing rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<HearingRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        HearingRule {
            id: "AUD-001",
            category: "Hearing Loss",
            description: "Sudden sensorineural hearing loss - urgent ENT referral required",
            concern_level: "high",
            evaluate: |d| {
                d.hearing_history.onset_type == "sudden"
                    && !has_air_bone_gap(
                        d.audiometric_results.right_ac_500,
                        d.audiometric_results.right_ac_1000,
                        d.audiometric_results.right_ac_2000,
                        d.audiometric_results.right_ac_4000,
                        d.audiometric_results.right_bc_500,
                        d.audiometric_results.right_bc_1000,
                        d.audiometric_results.right_bc_2000,
                        d.audiometric_results.right_bc_4000,
                    )
                    && !has_air_bone_gap(
                        d.audiometric_results.left_ac_500,
                        d.audiometric_results.left_ac_1000,
                        d.audiometric_results.left_ac_2000,
                        d.audiometric_results.left_ac_4000,
                        d.audiometric_results.left_bc_500,
                        d.audiometric_results.left_bc_1000,
                        d.audiometric_results.left_bc_2000,
                        d.audiometric_results.left_bc_4000,
                    )
            },
        },
        HearingRule {
            id: "AUD-002",
            category: "Hearing Loss",
            description: "Asymmetric hearing loss >15 dB between ears - acoustic neuroma screening advised",
            concern_level: "high",
            evaluate: |d| pta_asymmetry(d).is_some_and(|a| a > 15.0),
        },
        HearingRule {
            id: "AUD-003",
            category: "Tinnitus",
            description: "Unilateral tinnitus with hearing loss - ENT referral for retrocochlear evaluation",
            concern_level: "high",
            evaluate: |d| {
                d.tinnitus.tinnitus_present == "yes"
                    && (d.tinnitus.tinnitus_ear == "right" || d.tinnitus.tinnitus_ear == "left")
                    && {
                        let right_pta = calculate_pta(
                            d.audiometric_results.right_ac_500,
                            d.audiometric_results.right_ac_1000,
                            d.audiometric_results.right_ac_2000,
                            d.audiometric_results.right_ac_4000,
                        );
                        let left_pta = calculate_pta(
                            d.audiometric_results.left_ac_500,
                            d.audiometric_results.left_ac_1000,
                            d.audiometric_results.left_ac_2000,
                            d.audiometric_results.left_ac_4000,
                        );
                        right_pta.is_some_and(|p| p > 25.0) || left_pta.is_some_and(|p| p > 25.0)
                    }
            },
        },
        HearingRule {
            id: "AUD-004",
            category: "Balance",
            description: "Vestibular emergency - acute vertigo with neurological symptoms",
            concern_level: "high",
            evaluate: |d| {
                d.balance_assessment.dizziness_present == "yes"
                    && d.balance_assessment.dizziness_type == "vertigo"
                    && d.balance_assessment.nausea_with_dizziness == "yes"
                    && matches!(d.balance_assessment.dizziness_severity, Some(8..=10))
            },
        },
        HearingRule {
            id: "AUD-005",
            category: "Hearing Loss",
            description: "Conductive loss with active ear infection - medical treatment before audiological management",
            concern_level: "high",
            evaluate: |d| {
                d.otoscopic_examination.active_infection == "yes"
                    && (has_air_bone_gap(
                        d.audiometric_results.right_ac_500,
                        d.audiometric_results.right_ac_1000,
                        d.audiometric_results.right_ac_2000,
                        d.audiometric_results.right_ac_4000,
                        d.audiometric_results.right_bc_500,
                        d.audiometric_results.right_bc_1000,
                        d.audiometric_results.right_bc_2000,
                        d.audiometric_results.right_bc_4000,
                    ) || has_air_bone_gap(
                        d.audiometric_results.left_ac_500,
                        d.audiometric_results.left_ac_1000,
                        d.audiometric_results.left_ac_2000,
                        d.audiometric_results.left_ac_4000,
                        d.audiometric_results.left_bc_500,
                        d.audiometric_results.left_bc_1000,
                        d.audiometric_results.left_bc_2000,
                        d.audiometric_results.left_bc_4000,
                    ))
            },
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        HearingRule {
            id: "AUD-006",
            category: "Hearing Loss",
            description: "Moderate hearing loss - hearing aid evaluation recommended",
            concern_level: "medium",
            evaluate: |d| {
                let right = calculate_pta(
                    d.audiometric_results.right_ac_500,
                    d.audiometric_results.right_ac_1000,
                    d.audiometric_results.right_ac_2000,
                    d.audiometric_results.right_ac_4000,
                );
                let left = calculate_pta(
                    d.audiometric_results.left_ac_500,
                    d.audiometric_results.left_ac_1000,
                    d.audiometric_results.left_ac_2000,
                    d.audiometric_results.left_ac_4000,
                );
                let better = match (right, left) {
                    (Some(r), Some(l)) => r.min(l),
                    (Some(r), None) => r,
                    (None, Some(l)) => l,
                    _ => return false,
                };
                better > 40.0 && better <= 70.0
            },
        },
        HearingRule {
            id: "AUD-007",
            category: "Tinnitus",
            description: "Tinnitus with significant sleep disruption",
            concern_level: "medium",
            evaluate: |d| {
                d.tinnitus.tinnitus_present == "yes"
                    && matches!(d.tinnitus.tinnitus_sleep_impact, Some(7..=10))
            },
        },
        HearingRule {
            id: "AUD-008",
            category: "Tinnitus",
            description: "High tinnitus impact score - tinnitus management programme recommended",
            concern_level: "medium",
            evaluate: |d| tinnitus_impact_score(d).is_some_and(|s| s > 60.0),
        },
        HearingRule {
            id: "AUD-009",
            category: "Balance",
            description: "Recurrent dizziness with falls history - falls risk assessment needed",
            concern_level: "medium",
            evaluate: |d| {
                d.balance_assessment.dizziness_present == "yes"
                    && d.balance_assessment.falls_history == "yes"
            },
        },
        HearingRule {
            id: "AUD-010",
            category: "Communication",
            description: "Significant communication impact - aural rehabilitation recommended",
            concern_level: "medium",
            evaluate: |d| communication_impact_score(d).is_some_and(|s| s > 60.0),
        },
        HearingRule {
            id: "AUD-011",
            category: "Hearing Loss",
            description: "Noise exposure history without hearing protection - monitoring required",
            concern_level: "medium",
            evaluate: |d| {
                d.hearing_history.noise_exposure_history == "yes"
                    && d.hearing_history.hearing_protection_use != "always"
            },
        },
        HearingRule {
            id: "AUD-012",
            category: "Hearing Loss",
            description: "Ototoxic medication use - serial audiometric monitoring advised",
            concern_level: "medium",
            evaluate: |d| d.hearing_history.ototoxic_medication == "yes",
        },
        HearingRule {
            id: "AUD-013",
            category: "Otoscopy",
            description: "Abnormal tympanic membrane findings - ENT review recommended",
            concern_level: "medium",
            evaluate: |d| {
                d.otoscopic_examination.right_tympanic_membrane == "abnormal"
                    || d.otoscopic_examination.left_tympanic_membrane == "abnormal"
            },
        },
        HearingRule {
            id: "AUD-014",
            category: "Hearing Aid",
            description: "Low hearing aid satisfaction - reassessment and adjustment needed",
            concern_level: "medium",
            evaluate: |d| {
                d.hearing_aid_assessment.current_hearing_aid == "yes"
                    && matches!(d.hearing_aid_assessment.hearing_aid_satisfaction, Some(1..=2))
            },
        },
        HearingRule {
            id: "AUD-015",
            category: "Tympanometry",
            description: "Abnormal tympanogram - middle ear pathology investigation needed",
            concern_level: "medium",
            evaluate: |d| {
                let abnormal = |t: &str| t == "B" || t == "C" || t == "As" || t == "Ad";
                abnormal(&d.audiometric_results.right_tympanogram_type)
                    || abnormal(&d.audiometric_results.left_tympanogram_type)
            },
        },
        // ─── LOW CONCERN ────────────────────────────────────────
        HearingRule {
            id: "AUD-016",
            category: "Hearing Loss",
            description: "Normal hearing thresholds - routine follow-up appropriate",
            concern_level: "low",
            evaluate: |d| {
                let right = calculate_pta(
                    d.audiometric_results.right_ac_500,
                    d.audiometric_results.right_ac_1000,
                    d.audiometric_results.right_ac_2000,
                    d.audiometric_results.right_ac_4000,
                );
                let left = calculate_pta(
                    d.audiometric_results.left_ac_500,
                    d.audiometric_results.left_ac_1000,
                    d.audiometric_results.left_ac_2000,
                    d.audiometric_results.left_ac_4000,
                );
                let better = match (right, left) {
                    (Some(r), Some(l)) => r.min(l),
                    (Some(r), None) => r,
                    (None, Some(l)) => l,
                    _ => return false,
                };
                better <= 25.0
            },
        },
        HearingRule {
            id: "AUD-017",
            category: "Hearing Aid",
            description: "Good hearing aid satisfaction reported",
            concern_level: "low",
            evaluate: |d| {
                d.hearing_aid_assessment.current_hearing_aid == "yes"
                    && matches!(d.hearing_aid_assessment.hearing_aid_satisfaction, Some(4..=5))
            },
        },
        HearingRule {
            id: "AUD-018",
            category: "Communication",
            description: "Minimal communication impact - no immediate intervention needed",
            concern_level: "low",
            evaluate: |d| communication_impact_score(d).is_some_and(|s| s <= 25.0),
        },
        HearingRule {
            id: "AUD-019",
            category: "Tinnitus",
            description: "Tinnitus present but low impact - monitoring appropriate",
            concern_level: "low",
            evaluate: |d| {
                d.tinnitus.tinnitus_present == "yes"
                    && tinnitus_impact_score(d).is_some_and(|s| s <= 25.0)
            },
        },
        HearingRule {
            id: "AUD-020",
            category: "Balance",
            description: "No balance concerns reported",
            concern_level: "low",
            evaluate: |d| d.balance_assessment.dizziness_present == "no",
        },
    ]
}
