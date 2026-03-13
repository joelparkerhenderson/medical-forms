use super::types::AssessmentData;
use super::utils::{symptom_score, pft_score};

/// A declarative pulmonology concern rule.
pub struct PulmonologyRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All pulmonology rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<PulmonologyRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        PulmonologyRule {
            id: "PULM-001",
            category: "Symptoms",
            description: "Severe dyspnea reported (rated 5 - most severe)",
            concern_level: "high",
            evaluate: |d| d.symptom_assessment.dyspnea_severity == Some(5),
        },
        PulmonologyRule {
            id: "PULM-002",
            category: "Symptoms",
            description: "Hemoptysis (coughing up blood) present",
            concern_level: "high",
            evaluate: |d| d.symptom_assessment.hemoptysis_present == "yes",
        },
        PulmonologyRule {
            id: "PULM-003",
            category: "Pulmonary Function",
            description: "Severely reduced FEV1 (rated 1 - critically low)",
            concern_level: "high",
            evaluate: |d| d.pulmonary_function_tests.fev1_percent_predicted == Some(1),
        },
        PulmonologyRule {
            id: "PULM-004",
            category: "Blood Gases",
            description: "Hypoxemia requiring supplemental oxygen",
            concern_level: "high",
            evaluate: |d| d.arterial_blood_gases.supplemental_oxygen == "yes",
        },
        PulmonologyRule {
            id: "PULM-005",
            category: "Clinical",
            description: "Overall severity impression rated critical (5)",
            concern_level: "high",
            evaluate: |d| d.clinical_review.overall_severity_impression == Some(5),
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        PulmonologyRule {
            id: "PULM-006",
            category: "Symptoms",
            description: "Symptom severity dimension score above 60%",
            concern_level: "medium",
            evaluate: |d| symptom_score(d).is_some_and(|s| s > 60.0),
        },
        PulmonologyRule {
            id: "PULM-007",
            category: "Pulmonary Function",
            description: "PFT dimension score above 60% (significant impairment)",
            concern_level: "medium",
            evaluate: |d| pft_score(d).is_some_and(|s| s > 60.0),
        },
        PulmonologyRule {
            id: "PULM-008",
            category: "Smoking",
            description: "Active smoker identified",
            concern_level: "medium",
            evaluate: |d| d.smoking_exposure.smoking_status == "current",
        },
        PulmonologyRule {
            id: "PULM-009",
            category: "Imaging",
            description: "Pulmonary nodule detected on imaging",
            concern_level: "medium",
            evaluate: |d| d.chest_imaging.nodule_detected == "yes",
        },
        PulmonologyRule {
            id: "PULM-010",
            category: "Sleep",
            description: "Witnessed apnea episodes reported",
            concern_level: "medium",
            evaluate: |d| d.sleep_breathing.apnea_witnessed == "yes",
        },
        PulmonologyRule {
            id: "PULM-011",
            category: "History",
            description: "COPD history with frequent hospitalizations (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| {
                d.respiratory_history.copd_history == "yes"
                    && matches!(d.respiratory_history.previous_hospitalizations, Some(4..=5))
            },
        },
        PulmonologyRule {
            id: "PULM-012",
            category: "Treatment",
            description: "Poor treatment adherence (rated 1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.current_treatment.treatment_adherence, Some(1..=2)),
        },
        PulmonologyRule {
            id: "PULM-013",
            category: "Imaging",
            description: "Pleural effusion detected",
            concern_level: "medium",
            evaluate: |d| d.chest_imaging.pleural_effusion == "yes",
        },
        PulmonologyRule {
            id: "PULM-014",
            category: "Clinical",
            description: "Frequent exacerbations reported (3 or more per year)",
            concern_level: "medium",
            evaluate: |d| {
                d.clinical_review.exacerbation_frequency == "threeOrMore"
            },
        },
        PulmonologyRule {
            id: "PULM-015",
            category: "Symptoms",
            description: "Significant nocturnal symptoms (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.symptom_assessment.nocturnal_symptoms, Some(4..=5)),
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        PulmonologyRule {
            id: "PULM-016",
            category: "Pulmonary Function",
            description: "Normal FEV1 (rated 5 - within normal range)",
            concern_level: "low",
            evaluate: |d| d.pulmonary_function_tests.fev1_percent_predicted == Some(5),
        },
        PulmonologyRule {
            id: "PULM-017",
            category: "Clinical",
            description: "Good exercise tolerance (rated 1-2 - minimal limitation)",
            concern_level: "low",
            evaluate: |d| matches!(d.clinical_review.exercise_tolerance, Some(1..=2)),
        },
        PulmonologyRule {
            id: "PULM-018",
            category: "Treatment",
            description: "Excellent treatment adherence (rated 5)",
            concern_level: "low",
            evaluate: |d| d.current_treatment.treatment_adherence == Some(5),
        },
        PulmonologyRule {
            id: "PULM-019",
            category: "Treatment",
            description: "Treatment rated highly effective (rated 5)",
            concern_level: "low",
            evaluate: |d| d.current_treatment.treatment_effectiveness == Some(5),
        },
        PulmonologyRule {
            id: "PULM-020",
            category: "Symptoms",
            description: "All symptom items rated minimal (1) - well controlled",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.symptom_assessment.dyspnea_severity,
                    d.symptom_assessment.cough_severity,
                    d.symptom_assessment.sputum_production,
                    d.symptom_assessment.wheezing_frequency,
                    d.symptom_assessment.chest_tightness,
                    d.symptom_assessment.nocturnal_symptoms,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v == 1)
            },
        },
    ]
}
