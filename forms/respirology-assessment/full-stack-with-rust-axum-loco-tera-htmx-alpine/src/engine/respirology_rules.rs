use super::types::AssessmentData;
use super::utils::{spirometry_score, oxygen_score, dyspnoea_score};

/// A declarative respiratory concern rule.
pub struct RespiratoryRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All respiratory rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<RespiratoryRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        RespiratoryRule {
            id: "RESP-001",
            category: "Oxygen",
            description: "Resting SpO2 critically low (rated 5 - severe hypoxaemia)",
            concern_level: "high",
            evaluate: |d| d.oxygen_assessment.resting_spo2 == Some(5),
        },
        RespiratoryRule {
            id: "RESP-002",
            category: "Spirometry",
            description: "Spirometry dimension score above 80% (severe obstruction/restriction)",
            concern_level: "high",
            evaluate: |d| spirometry_score(d).is_some_and(|s| s > 80.0),
        },
        RespiratoryRule {
            id: "RESP-003",
            category: "Dyspnoea",
            description: "Dyspnoea at rest rated severe (4-5)",
            concern_level: "high",
            evaluate: |d| matches!(d.dyspnoea_assessment.dyspnoea_at_rest, Some(4..=5)),
        },
        RespiratoryRule {
            id: "RESP-004",
            category: "Cough",
            description: "Haemoptysis present (rated 4-5)",
            concern_level: "high",
            evaluate: |d| matches!(d.cough_assessment.haemoptysis, Some(4..=5)),
        },
        RespiratoryRule {
            id: "RESP-005",
            category: "Clinical",
            description: "Overall respiratory status rated very poor (5)",
            concern_level: "high",
            evaluate: |d| d.clinical_review.overall_respiratory_status == Some(5),
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        RespiratoryRule {
            id: "RESP-006",
            category: "Spirometry",
            description: "FEV1 percent predicted significantly impaired (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.spirometry_results.fev1_percent_predicted, Some(4..=5)),
        },
        RespiratoryRule {
            id: "RESP-007",
            category: "Oxygen",
            description: "Exertional SpO2 desaturation (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.oxygen_assessment.exertional_spo2, Some(4..=5)),
        },
        RespiratoryRule {
            id: "RESP-008",
            category: "Infections",
            description: "Frequent exacerbations (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.respiratory_infections.exacerbation_frequency, Some(4..=5)),
        },
        RespiratoryRule {
            id: "RESP-009",
            category: "Infections",
            description: "Frequent hospitalisation for respiratory illness (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.respiratory_infections.hospitalisation_frequency, Some(4..=5)),
        },
        RespiratoryRule {
            id: "RESP-010",
            category: "Dyspnoea",
            description: "MRC dyspnoea scale high (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.dyspnoea_assessment.mrc_dyspnoea_scale, Some(4..=5)),
        },
        RespiratoryRule {
            id: "RESP-011",
            category: "Symptoms",
            description: "Exercise tolerance severely limited (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.respiratory_symptoms.exercise_tolerance, Some(4..=5)),
        },
        RespiratoryRule {
            id: "RESP-012",
            category: "Medication",
            description: "Poor inhaler technique (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.inhaler_medications.inhaler_technique, Some(4..=5)),
        },
        RespiratoryRule {
            id: "RESP-013",
            category: "Medication",
            description: "Poor medication adherence (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.inhaler_medications.medication_adherence, Some(4..=5)),
        },
        RespiratoryRule {
            id: "RESP-014",
            category: "Clinical",
            description: "Quality of life significantly impacted (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.clinical_review.quality_of_life_impact, Some(4..=5)),
        },
        RespiratoryRule {
            id: "RESP-015",
            category: "Dyspnoea",
            description: "Dyspnoea dimension score above 60% (moderate-severe dyspnoea)",
            concern_level: "medium",
            evaluate: |d| dyspnoea_score(d).is_some_and(|s| s > 60.0),
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        RespiratoryRule {
            id: "RESP-016",
            category: "Spirometry",
            description: "Spirometry results within normal limits (all rated 1)",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.spirometry_results.fev1_percent_predicted,
                    d.spirometry_results.fvc_percent_predicted,
                    d.spirometry_results.fev1_fvc_ratio,
                    d.spirometry_results.peak_flow_percent_predicted,
                    d.spirometry_results.bronchodilator_response,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v == 1)
            },
        },
        RespiratoryRule {
            id: "RESP-017",
            category: "Oxygen",
            description: "Oxygen saturations normal (resting and exertional rated 1)",
            concern_level: "low",
            evaluate: |d| {
                d.oxygen_assessment.resting_spo2 == Some(1)
                    && d.oxygen_assessment.exertional_spo2 == Some(1)
            },
        },
        RespiratoryRule {
            id: "RESP-018",
            category: "Clinical",
            description: "Good treatment response (rated 1-2)",
            concern_level: "low",
            evaluate: |d| matches!(d.clinical_review.treatment_response, Some(1..=2)),
        },
        RespiratoryRule {
            id: "RESP-019",
            category: "Medication",
            description: "Good inhaler technique and adherence (both rated 1-2)",
            concern_level: "low",
            evaluate: |d| {
                matches!(d.inhaler_medications.inhaler_technique, Some(1..=2))
                    && matches!(d.inhaler_medications.medication_adherence, Some(1..=2))
            },
        },
        RespiratoryRule {
            id: "RESP-020",
            category: "Clinical",
            description: "Overall respiratory status rated good (1)",
            concern_level: "low",
            evaluate: |d| d.clinical_review.overall_respiratory_status == Some(1),
        },
    ]
}
