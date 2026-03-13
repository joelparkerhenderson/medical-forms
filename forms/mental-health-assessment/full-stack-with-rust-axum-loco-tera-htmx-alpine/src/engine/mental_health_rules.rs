use super::types::AssessmentData;
use super::utils::{phq9_total, gad7_total};

/// A declarative mental health concern rule.
pub struct MentalHealthRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All mental health rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<MentalHealthRule> {
    vec![
        // ─── HIGH CONCERN (MH-001 to MH-005) ────────────────────
        MentalHealthRule {
            id: "MH-001",
            category: "Risk",
            description: "Active suicidal ideation (PHQ-9 Q9 >= 2)",
            concern_level: "high",
            evaluate: |d| matches!(d.depression_screening.phq9_self_harm, Some(2..=3)),
        },
        MentalHealthRule {
            id: "MH-002",
            category: "Depression",
            description: "PHQ-9 total score >= 20 (severe depression)",
            concern_level: "high",
            evaluate: |d| phq9_total(d) >= 20,
        },
        MentalHealthRule {
            id: "MH-003",
            category: "Risk",
            description: "Suicide plan or means present",
            concern_level: "high",
            evaluate: |d| d.risk_assessment.suicide_plan_or_means == "yes",
        },
        MentalHealthRule {
            id: "MH-004",
            category: "Risk",
            description: "Recent self-harm reported",
            concern_level: "high",
            evaluate: |d| !d.risk_assessment.self_harm_recent.is_empty() && d.risk_assessment.self_harm_recent != "none" && d.risk_assessment.self_harm_history == "yes",
        },
        MentalHealthRule {
            id: "MH-005",
            category: "Safeguarding",
            description: "Safeguarding concerns identified",
            concern_level: "high",
            evaluate: |d| d.risk_assessment.safeguarding_concerns == "yes",
        },
        // ─── MEDIUM CONCERN (MH-006 to MH-015) ──────────────────
        MentalHealthRule {
            id: "MH-006",
            category: "Depression",
            description: "PHQ-9 total score 15-19 (moderately severe depression)",
            concern_level: "medium",
            evaluate: |d| {
                let score = phq9_total(d);
                (15..=19).contains(&score)
            },
        },
        MentalHealthRule {
            id: "MH-007",
            category: "Anxiety",
            description: "GAD-7 total score >= 15 (severe anxiety)",
            concern_level: "medium",
            evaluate: |d| gad7_total(d) >= 15,
        },
        MentalHealthRule {
            id: "MH-008",
            category: "Risk",
            description: "Passive suicidal ideation reported",
            concern_level: "medium",
            evaluate: |d| d.risk_assessment.suicidal_ideation == "passive",
        },
        MentalHealthRule {
            id: "MH-009",
            category: "Substance",
            description: "Substance misuse with mental health condition",
            concern_level: "medium",
            evaluate: |d| {
                d.substance_use.prescription_misuse == "yes"
                    || (!d.substance_use.other_substances.is_empty()
                        && d.substance_use.other_substances != "none")
            },
        },
        MentalHealthRule {
            id: "MH-010",
            category: "Social",
            description: "Poor social support (< 2 out of 5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.social_functional_status.social_support, Some(1)),
        },
        MentalHealthRule {
            id: "MH-011",
            category: "Functional",
            description: "Poor daily functioning (< 2 out of 5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.social_functional_status.daily_functioning, Some(1)),
        },
        MentalHealthRule {
            id: "MH-012",
            category: "Treatment",
            description: "Poor treatment response (< 2 out of 5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.current_treatment.treatment_response, Some(1)),
        },
        MentalHealthRule {
            id: "MH-013",
            category: "Medication",
            description: "Medication non-adherence (< 2 out of 5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.current_treatment.medication_adherence, Some(1)),
        },
        MentalHealthRule {
            id: "MH-014",
            category: "Combined",
            description: "Combined moderate depression and anxiety (PHQ-9 >= 10 and GAD-7 >= 10)",
            concern_level: "medium",
            evaluate: |d| phq9_total(d) >= 10 && gad7_total(d) >= 10,
        },
        MentalHealthRule {
            id: "MH-015",
            category: "Trauma",
            description: "Trauma history with current symptoms",
            concern_level: "medium",
            evaluate: |d| {
                d.mental_health_history.trauma_history == "yes"
                    && (phq9_total(d) >= 10 || gad7_total(d) >= 10)
            },
        },
        // ─── LOW CONCERN (positive indicators, MH-016 to MH-020) ─
        MentalHealthRule {
            id: "MH-016",
            category: "Depression",
            description: "PHQ-9 total score < 5 (minimal depression)",
            concern_level: "low",
            evaluate: |d| {
                let score = phq9_total(d);
                score < 5 && d.depression_screening.phq1_interest.is_some()
            },
        },
        MentalHealthRule {
            id: "MH-017",
            category: "Anxiety",
            description: "GAD-7 total score < 5 (minimal anxiety)",
            concern_level: "low",
            evaluate: |d| {
                let score = gad7_total(d);
                score < 5 && d.anxiety_screening.gad1_nervous.is_some()
            },
        },
        MentalHealthRule {
            id: "MH-018",
            category: "Treatment",
            description: "Good treatment response (>= 4 out of 5)",
            concern_level: "low",
            evaluate: |d| matches!(d.current_treatment.treatment_response, Some(4..=5)),
        },
        MentalHealthRule {
            id: "MH-019",
            category: "Social",
            description: "Strong social support (>= 4 out of 5)",
            concern_level: "low",
            evaluate: |d| matches!(d.social_functional_status.social_support, Some(4..=5)),
        },
        MentalHealthRule {
            id: "MH-020",
            category: "Treatment",
            description: "Engaged in therapy",
            concern_level: "low",
            evaluate: |d| {
                !d.current_treatment.therapy_type.is_empty()
                    && d.current_treatment.therapy_type != "none"
            },
        },
    ]
}
