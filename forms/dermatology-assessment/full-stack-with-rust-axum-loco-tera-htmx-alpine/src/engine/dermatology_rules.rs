use super::types::AssessmentData;
use super::utils::calculate_dlqi_score;

/// A declarative dermatology concern rule.
pub struct DermatologyRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All dermatology rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<DermatologyRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        DermatologyRule {
            id: "DERM-001",
            category: "DLQI",
            description: "DLQI score >= 21 (very large effect on quality of life)",
            concern_level: "high",
            evaluate: |d| calculate_dlqi_score(d).is_some_and(|s| s >= 21),
        },
        DermatologyRule {
            id: "DERM-002",
            category: "BSA",
            description: "Body surface area affected > 30%",
            concern_level: "high",
            evaluate: |d| d.current_condition.body_area_affected.is_some_and(|v| v > 30),
        },
        DermatologyRule {
            id: "DERM-003",
            category: "Symptoms",
            description: "Severe itching and pain (both >= 8/10)",
            concern_level: "high",
            evaluate: |d| {
                d.symptom_severity.itching.is_some_and(|v| v >= 8)
                    && d.symptom_severity.pain.is_some_and(|v| v >= 8)
            },
        },
        DermatologyRule {
            id: "DERM-004",
            category: "Infection",
            description: "Signs of skin infection present",
            concern_level: "high",
            evaluate: |d| d.current_condition.infection_signs == "yes",
        },
        DermatologyRule {
            id: "DERM-005",
            category: "Treatment",
            description: "Treatment failure on systemic therapy",
            concern_level: "high",
            evaluate: |d| {
                !d.previous_treatments.systemic_therapy.is_empty()
                    && d.previous_treatments.systemic_therapy != "none"
                    && d.current_treatment.treatment_response.is_some_and(|v| v <= 2)
            },
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        DermatologyRule {
            id: "DERM-006",
            category: "DLQI",
            description: "DLQI score 11-20 (moderate to large effect on quality of life)",
            concern_level: "medium",
            evaluate: |d| calculate_dlqi_score(d).is_some_and(|s| s >= 11 && s <= 20),
        },
        DermatologyRule {
            id: "DERM-007",
            category: "BSA",
            description: "Body surface area affected 10-30%",
            concern_level: "medium",
            evaluate: |d| d.current_condition.body_area_affected.is_some_and(|v| v >= 10 && v <= 30),
        },
        DermatologyRule {
            id: "DERM-008",
            category: "Symptoms",
            description: "Moderate symptoms (itching or pain 5-7/10)",
            concern_level: "medium",
            evaluate: |d| {
                d.symptom_severity.itching.is_some_and(|v| v >= 5 && v <= 7)
                    || d.symptom_severity.pain.is_some_and(|v| v >= 5 && v <= 7)
            },
        },
        DermatologyRule {
            id: "DERM-009",
            category: "Treatment",
            description: "Poor treatment adherence (1-2/5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.current_treatment.treatment_adherence, Some(1..=2)),
        },
        DermatologyRule {
            id: "DERM-010",
            category: "Comorbidity",
            description: "Psoriatic arthritis present",
            concern_level: "medium",
            evaluate: |d| d.triggers_comorbidities.psoriasis_arthritis == "yes",
        },
        DermatologyRule {
            id: "DERM-011",
            category: "Sleep",
            description: "Sleep disturbance >= 4/5",
            concern_level: "medium",
            evaluate: |d| d.symptom_severity.sleep_disturbance.is_some_and(|v| v >= 4),
        },
        DermatologyRule {
            id: "DERM-012",
            category: "Treatment",
            description: "Multiple treatment failures (>= 3)",
            concern_level: "medium",
            evaluate: |d| d.previous_treatments.treatment_failures.is_some_and(|v| v >= 3),
        },
        DermatologyRule {
            id: "DERM-013",
            category: "Condition",
            description: "Active flare of condition",
            concern_level: "medium",
            evaluate: |d| d.current_condition.condition_status == "flare",
        },
        DermatologyRule {
            id: "DERM-014",
            category: "Mental Health",
            description: "Mental health impact >= 4/5",
            concern_level: "medium",
            evaluate: |d| d.triggers_comorbidities.mental_health_impact.is_some_and(|v| v >= 4),
        },
        DermatologyRule {
            id: "DERM-015",
            category: "Scarring",
            description: "Scarring present",
            concern_level: "medium",
            evaluate: |d| d.current_condition.scarring == "yes",
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        DermatologyRule {
            id: "DERM-016",
            category: "DLQI",
            description: "DLQI score 0-5 (no or small effect on quality of life)",
            concern_level: "low",
            evaluate: |d| calculate_dlqi_score(d).is_some_and(|s| s <= 5),
        },
        DermatologyRule {
            id: "DERM-017",
            category: "Condition",
            description: "Condition in remission",
            concern_level: "low",
            evaluate: |d| d.current_condition.condition_status == "remission",
        },
        DermatologyRule {
            id: "DERM-018",
            category: "Treatment",
            description: "Good treatment response (>= 4/5)",
            concern_level: "low",
            evaluate: |d| d.current_treatment.treatment_response.is_some_and(|v| v >= 4),
        },
        DermatologyRule {
            id: "DERM-019",
            category: "Emollient",
            description: "Regular emollient use (>= 4/5)",
            concern_level: "low",
            evaluate: |d| d.current_treatment.emollient_use.is_some_and(|v| v >= 4),
        },
        DermatologyRule {
            id: "DERM-020",
            category: "Triggers",
            description: "Identified triggers managed",
            concern_level: "low",
            evaluate: |d| {
                // Positive: triggers identified and condition is not in flare
                (d.triggers_comorbidities.stress_trigger == "yes"
                    || !d.triggers_comorbidities.weather_trigger.is_empty()
                    || !d.triggers_comorbidities.contact_allergens.is_empty())
                    && d.current_condition.condition_status != "flare"
                    && d.current_condition.condition_status != "active"
            },
        },
    ]
}
