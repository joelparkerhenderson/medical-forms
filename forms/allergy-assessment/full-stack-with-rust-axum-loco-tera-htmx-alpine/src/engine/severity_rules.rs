use super::types::AssessmentData;
use super::utils::{count_allergen_categories, symptoms_score};

/// A declarative allergy severity concern rule.
pub struct SeverityRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All severity rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<SeverityRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        SeverityRule {
            id: "ALG-001",
            category: "Anaphylaxis",
            description: "Previous anaphylaxis reported",
            concern_level: "high",
            evaluate: |d| d.allergy_history.previous_anaphylaxis == "yes",
        },
        SeverityRule {
            id: "ALG-002",
            category: "Cardiovascular",
            description: "Cardiovascular symptoms severity >= 4 (systemic reaction risk)",
            concern_level: "high",
            evaluate: |d| d.symptoms_reactions.cardiovascular_symptoms.is_some_and(|v| v >= 4),
        },
        SeverityRule {
            id: "ALG-003",
            category: "Multiple Allergies",
            description: "Multiple severe allergies (severity rating >= 4 with multiple categories)",
            concern_level: "high",
            evaluate: |d| {
                d.current_allergies.severity_rating.is_some_and(|v| v >= 4)
                    && count_allergen_categories(d) >= 3
            },
        },
        SeverityRule {
            id: "ALG-004",
            category: "Emergency Preparedness",
            description: "EpiPen not prescribed despite anaphylaxis history",
            concern_level: "high",
            evaluate: |d| {
                d.allergy_history.previous_anaphylaxis == "yes"
                    && d.allergy_history.epi_pen_prescribed != "yes"
            },
        },
        SeverityRule {
            id: "ALG-005",
            category: "Drug Allergy",
            description: "Drug allergy with high severity rating (>= 4)",
            concern_level: "high",
            evaluate: |d| {
                !d.food_drug_allergies.drug_allergies.is_empty()
                    && d.food_drug_allergies.drug_allergies != "none"
                    && d.current_allergies.severity_rating.is_some_and(|v| v >= 4)
            },
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        SeverityRule {
            id: "ALG-006",
            category: "Respiratory",
            description: "Respiratory symptoms severity >= 3",
            concern_level: "medium",
            evaluate: |d| d.symptoms_reactions.respiratory_symptoms.is_some_and(|v| v >= 3),
        },
        SeverityRule {
            id: "ALG-007",
            category: "Multiple Allergies",
            description: "Multiple allergen categories affected (>= 3)",
            concern_level: "medium",
            evaluate: |d| count_allergen_categories(d) >= 3,
        },
        SeverityRule {
            id: "ALG-008",
            category: "Drug Allergy",
            description: "Unverified drug allergy reported",
            concern_level: "medium",
            evaluate: |d| {
                !d.food_drug_allergies.drug_allergies.is_empty()
                    && d.food_drug_allergies.drug_allergies != "none"
                    && d.food_drug_allergies.allergy_verified != "yes"
            },
        },
        SeverityRule {
            id: "ALG-009",
            category: "Emergency Plan",
            description: "No emergency plan in place",
            concern_level: "medium",
            evaluate: |d| d.emergency_plan.has_emergency_plan != "yes",
        },
        SeverityRule {
            id: "ALG-010",
            category: "Skin",
            description: "Skin symptoms severity >= 3",
            concern_level: "medium",
            evaluate: |d| d.symptoms_reactions.skin_symptoms.is_some_and(|v| v >= 3),
        },
        SeverityRule {
            id: "ALG-011",
            category: "Testing",
            description: "High total IgE level (>= 200 kU/L)",
            concern_level: "medium",
            evaluate: |d| d.testing_results.total_ige_level.is_some_and(|v| v >= 200.0),
        },
        SeverityRule {
            id: "ALG-012",
            category: "Treatment",
            description: "No immunotherapy despite severe allergy (severity >= 4)",
            concern_level: "medium",
            evaluate: |d| {
                d.current_allergies.severity_rating.is_some_and(|v| v >= 4)
                    && d.current_treatment.immunotherapy != "yes"
            },
        },
        SeverityRule {
            id: "ALG-013",
            category: "Environmental",
            description: "Both seasonal and perennial triggers present",
            concern_level: "medium",
            evaluate: |d| {
                d.environmental_triggers.seasonal_pattern == "both"
                    || (d.environmental_triggers.indoor_outdoor_triggers == "both"
                        && !d.environmental_triggers.seasonal_pattern.is_empty())
            },
        },
        SeverityRule {
            id: "ALG-014",
            category: "Food Allergy",
            description: "Food allergy without anaphylaxis action plan",
            concern_level: "medium",
            evaluate: |d| {
                !d.food_drug_allergies.food_allergies.is_empty()
                    && d.food_drug_allergies.food_allergies != "none"
                    && d.emergency_plan.anaphylaxis_action_plan != "yes"
            },
        },
        SeverityRule {
            id: "ALG-015",
            category: "Gastrointestinal",
            description: "GI symptoms severity >= 3",
            concern_level: "medium",
            evaluate: |d| d.symptoms_reactions.gastrointestinal_symptoms.is_some_and(|v| v >= 3),
        },
        // ─── LOW CONCERN ─────────────────────────────────────────
        SeverityRule {
            id: "ALG-016",
            category: "Skin",
            description: "Mild skin symptoms only (severity 1-2, no other high symptoms)",
            concern_level: "low",
            evaluate: |d| {
                d.symptoms_reactions.skin_symptoms.is_some_and(|v| v <= 2)
                    && d.symptoms_reactions.respiratory_symptoms.unwrap_or(0) <= 2
                    && d.symptoms_reactions.cardiovascular_symptoms.unwrap_or(0) <= 2
                    && d.symptoms_reactions.gastrointestinal_symptoms.unwrap_or(0) <= 2
                    && d.symptoms_reactions.anaphylaxis_risk.unwrap_or(0) <= 2
                    && symptoms_score(d).is_some()
            },
        },
        SeverityRule {
            id: "ALG-017",
            category: "Allergen Count",
            description: "Single known allergen only",
            concern_level: "low",
            evaluate: |d| d.allergy_history.number_of_known_allergies == Some(1),
        },
        SeverityRule {
            id: "ALG-018",
            category: "Treatment",
            description: "Well controlled on antihistamine alone",
            concern_level: "low",
            evaluate: |d| {
                !d.current_treatment.antihistamine_use.is_empty()
                    && d.current_treatment.antihistamine_use != "none"
                    && d.current_allergies.severity_rating.is_some_and(|v| v <= 2)
            },
        },
        SeverityRule {
            id: "ALG-019",
            category: "Follow-up",
            description: "Regular follow-up planned",
            concern_level: "low",
            evaluate: |d| {
                !d.review_assessment.follow_up_interval.is_empty()
                    && d.review_assessment.follow_up_interval != "none"
            },
        },
        SeverityRule {
            id: "ALG-020",
            category: "Testing",
            description: "Negative skin prick test result",
            concern_level: "low",
            evaluate: |d| {
                d.testing_results.skin_prick_test_done == "yes"
                    && d.testing_results.skin_prick_test_result == "negative"
            },
        },
    ]
}
