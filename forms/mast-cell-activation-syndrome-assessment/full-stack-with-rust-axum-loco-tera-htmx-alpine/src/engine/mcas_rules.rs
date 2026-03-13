use super::types::AssessmentData;
use super::utils::{elevated_mediator_count, gi_score, respiratory_score, skin_score};

/// A declarative MCAS severity concern rule.
pub struct McasRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All MCAS rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<McasRule> {
    vec![
        // ─── HIGH CONCERN ────────────────────────────────────────
        McasRule {
            id: "MCAS-001",
            category: "Anaphylaxis",
            description: "History of previous anaphylaxis reported",
            concern_level: "high",
            evaluate: |d| d.respiratory_symptoms.previous_anaphylaxis == "yes",
        },
        McasRule {
            id: "MCAS-002",
            category: "Respiratory",
            description: "Throat tightness or stridor indicating airway compromise",
            concern_level: "high",
            evaluate: |d| {
                d.respiratory_symptoms.stridor_present == "yes"
                    || matches!(d.respiratory_symptoms.throat_tightness_severity, Some(4..=5))
            },
        },
        McasRule {
            id: "MCAS-003",
            category: "Cardiovascular",
            description: "Severe hypotension episodes (syncope/presyncope rated 4-5)",
            concern_level: "high",
            evaluate: |d| matches!(d.cardiovascular_neurological.presyncope_syncope, Some(4..=5)),
        },
        McasRule {
            id: "MCAS-004",
            category: "Laboratory",
            description: "Three or more mast cell mediators elevated",
            concern_level: "high",
            evaluate: |d| elevated_mediator_count(d) >= 3,
        },
        McasRule {
            id: "MCAS-005",
            category: "Clinical",
            description: "Clinician severity assessment rated severe or anaphylactic (4-5)",
            concern_level: "high",
            evaluate: |d| matches!(d.clinical_review.clinician_severity_assessment, Some(4..=5)),
        },
        // ─── MEDIUM CONCERN ──────────────────────────────────────
        McasRule {
            id: "MCAS-006",
            category: "Skin",
            description: "Skin manifestations dimension score above 60%",
            concern_level: "medium",
            evaluate: |d| skin_score(d).is_some_and(|s| s > 60.0),
        },
        McasRule {
            id: "MCAS-007",
            category: "Gastrointestinal",
            description: "GI symptoms dimension score above 60%",
            concern_level: "medium",
            evaluate: |d| gi_score(d).is_some_and(|s| s > 60.0),
        },
        McasRule {
            id: "MCAS-008",
            category: "Respiratory",
            description: "Respiratory dimension score above 60%",
            concern_level: "medium",
            evaluate: |d| respiratory_score(d).is_some_and(|s| s > 60.0),
        },
        McasRule {
            id: "MCAS-009",
            category: "Symptom History",
            description: "Overall symptom severity rated high (4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.symptom_history.symptom_severity_overall, Some(4..=5)),
        },
        McasRule {
            id: "MCAS-010",
            category: "Symptom History",
            description: "Significant daily life impact (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.symptom_history.symptom_impact_daily_life, Some(4..=5)),
        },
        McasRule {
            id: "MCAS-011",
            category: "Triggers",
            description: "Multiple high-severity triggers identified (3+ rated 4-5)",
            concern_level: "medium",
            evaluate: |d| {
                let items = [
                    d.trigger_identification.heat_trigger,
                    d.trigger_identification.stress_trigger,
                    d.trigger_identification.exercise_trigger,
                    d.trigger_identification.food_trigger,
                    d.trigger_identification.medication_trigger,
                    d.trigger_identification.fragrance_chemical_trigger,
                    d.trigger_identification.insect_sting_trigger,
                ];
                let severe_count = items.iter().filter(|x| matches!(x, Some(4..=5))).count();
                severe_count >= 3
            },
        },
        McasRule {
            id: "MCAS-012",
            category: "Treatment",
            description: "Poor response to H1 antihistamines (rated 1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.current_treatment.h1_antihistamine_response, Some(1..=2)),
        },
        McasRule {
            id: "MCAS-013",
            category: "Laboratory",
            description: "Serum tryptase elevated",
            concern_level: "medium",
            evaluate: |d| d.laboratory_studies.serum_tryptase_elevated == "yes",
        },
        McasRule {
            id: "MCAS-014",
            category: "Gastrointestinal",
            description: "Multiple food intolerances reported (more than 5)",
            concern_level: "medium",
            evaluate: |d| d.gastrointestinal_symptoms.food_intolerances_count == "moreThan5",
        },
        McasRule {
            id: "MCAS-015",
            category: "Clinical",
            description: "Quality of life severely impacted (rated 4-5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.clinical_review.quality_of_life_impact, Some(4..=5)),
        },
        // ─── LOW CONCERN (positive indicators) ───────────────────
        McasRule {
            id: "MCAS-016",
            category: "Treatment",
            description: "Good response to mast cell stabilizer therapy (rated 4-5)",
            concern_level: "low",
            evaluate: |d| matches!(d.current_treatment.mast_cell_stabilizer_response, Some(4..=5)),
        },
        McasRule {
            id: "MCAS-017",
            category: "Treatment",
            description: "Good response to mediator-directed therapy (rated 4-5)",
            concern_level: "low",
            evaluate: |d| matches!(d.clinical_review.response_to_mediator_therapy, Some(4..=5)),
        },
        McasRule {
            id: "MCAS-018",
            category: "Clinical",
            description: "Consensus diagnostic criteria met",
            concern_level: "low",
            evaluate: |d| d.clinical_review.consensus_criteria_met == "yes",
        },
        McasRule {
            id: "MCAS-019",
            category: "Symptom History",
            description: "Mild symptom severity overall (rated 1-2)",
            concern_level: "low",
            evaluate: |d| matches!(d.symptom_history.symptom_severity_overall, Some(1..=2)),
        },
        McasRule {
            id: "MCAS-020",
            category: "Clinical",
            description: "Clinician assessment indicates mild disease (rated 1-2)",
            concern_level: "low",
            evaluate: |d| matches!(d.clinical_review.clinician_severity_assessment, Some(1..=2)),
        },
    ]
}
