use super::types::AssessmentData;
use super::utils::hba1c_mmol_mol;

/// A declarative diabetes control rule.
pub struct DiabetesRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All diabetes rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<DiabetesRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        DiabetesRule {
            id: "DM-001",
            category: "Glycaemic Control",
            description: "HbA1c >= 86 mmol/mol (>= 10%) - very poor glycaemic control",
            concern_level: "high",
            evaluate: |d| hba1c_mmol_mol(d).is_some_and(|v| v >= 86.0),
        },
        DiabetesRule {
            id: "DM-002",
            category: "Hypoglycaemia",
            description: "Severe hypoglycaemia reported",
            concern_level: "high",
            evaluate: |d| d.glycaemic_control.severe_hypoglycaemia == "yes",
        },
        DiabetesRule {
            id: "DM-003",
            category: "Foot",
            description: "Active foot ulcer present",
            concern_level: "high",
            evaluate: |d| d.foot_assessment.ulcer_present == "yes",
        },
        DiabetesRule {
            id: "DM-004",
            category: "Eye",
            description: "Proliferative retinopathy detected",
            concern_level: "high",
            evaluate: |d| d.complications_screening.retinopathy_status == "proliferative",
        },
        DiabetesRule {
            id: "DM-005",
            category: "Renal",
            description: "eGFR < 30 - severe renal impairment",
            concern_level: "high",
            evaluate: |d| d.complications_screening.egfr.is_some_and(|v| v < 30.0),
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        DiabetesRule {
            id: "DM-006",
            category: "Glycaemic Control",
            description: "HbA1c 64-85 mmol/mol (8-9.9%) - suboptimal glycaemic control",
            concern_level: "medium",
            evaluate: |d| hba1c_mmol_mol(d).is_some_and(|v| v >= 64.0 && v < 86.0),
        },
        DiabetesRule {
            id: "DM-007",
            category: "Hypoglycaemia",
            description: "Recurrent hypoglycaemia reported",
            concern_level: "medium",
            evaluate: |d| {
                d.glycaemic_control.hypoglycaemia_frequency == "weekly"
                    || d.glycaemic_control.hypoglycaemia_frequency == "daily"
            },
        },
        DiabetesRule {
            id: "DM-008",
            category: "Eye",
            description: "Background retinopathy detected",
            concern_level: "medium",
            evaluate: |d| d.complications_screening.retinopathy_status == "background",
        },
        DiabetesRule {
            id: "DM-009",
            category: "Renal",
            description: "eGFR 30-59 - moderate renal impairment",
            concern_level: "medium",
            evaluate: |d| {
                d.complications_screening.egfr.is_some_and(|v| v >= 30.0 && v < 60.0)
            },
        },
        DiabetesRule {
            id: "DM-010",
            category: "Renal",
            description: "Microalbuminuria detected (elevated urine ACR)",
            concern_level: "medium",
            evaluate: |d| d.complications_screening.urine_acr.is_some_and(|v| v > 3.0),
        },
        DiabetesRule {
            id: "DM-011",
            category: "Neuropathy",
            description: "Neuropathy symptoms reported",
            concern_level: "medium",
            evaluate: |d| d.complications_screening.neuropathy_symptoms == "yes",
        },
        DiabetesRule {
            id: "DM-012",
            category: "Medication",
            description: "Poor medication adherence (1-2 out of 5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.medications.medication_adherence, Some(1..=2)),
        },
        DiabetesRule {
            id: "DM-013",
            category: "Self-Care",
            description: "BMI >= 35 - obesity class II or above",
            concern_level: "medium",
            evaluate: |d| d.self_care_lifestyle.bmi.is_some_and(|v| v >= 35.0),
        },
        DiabetesRule {
            id: "DM-014",
            category: "Self-Care",
            description: "Poor diet adherence (1-2 out of 5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.self_care_lifestyle.diet_adherence, Some(1..=2)),
        },
        DiabetesRule {
            id: "DM-015",
            category: "Psychological",
            description: "High diabetes distress (4-5 out of 5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.psychological_wellbeing.diabetes_distress, Some(4..=5)),
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        DiabetesRule {
            id: "DM-016",
            category: "Glycaemic Control",
            description: "HbA1c at target (<= 53 mmol/mol / <= 7%)",
            concern_level: "low",
            evaluate: |d| hba1c_mmol_mol(d).is_some_and(|v| v <= 53.0),
        },
        DiabetesRule {
            id: "DM-017",
            category: "Complications",
            description: "No complications detected across all screening domains",
            concern_level: "low",
            evaluate: |d| {
                (d.complications_screening.retinopathy_status.is_empty()
                    || d.complications_screening.retinopathy_status == "none")
                    && d.complications_screening.neuropathy_symptoms != "yes"
                    && d.complications_screening.egfr.map_or(true, |v| v >= 60.0)
                    && d.foot_assessment.ulcer_present != "yes"
                    && d.cardiovascular_risk.previous_cvd_event != "yes"
            },
        },
        DiabetesRule {
            id: "DM-018",
            category: "Self-Care",
            description: "Good self-care adherence (diet >= 4/5)",
            concern_level: "low",
            evaluate: |d| matches!(d.self_care_lifestyle.diet_adherence, Some(4..=5)),
        },
        DiabetesRule {
            id: "DM-019",
            category: "Self-Care",
            description: "Physically active (regular or very active)",
            concern_level: "low",
            evaluate: |d| {
                d.self_care_lifestyle.physical_activity == "regular"
                    || d.self_care_lifestyle.physical_activity == "veryActive"
            },
        },
        DiabetesRule {
            id: "DM-020",
            category: "Psychological",
            description: "Good psychological wellbeing (low distress, good coping)",
            concern_level: "low",
            evaluate: |d| {
                matches!(d.psychological_wellbeing.diabetes_distress, Some(1..=2))
                    && matches!(d.psychological_wellbeing.coping_ability, Some(4..=5))
            },
        },
    ]
}
