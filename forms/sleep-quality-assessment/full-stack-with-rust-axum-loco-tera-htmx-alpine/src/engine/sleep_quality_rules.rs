use super::types::AssessmentData;
use super::utils::{calculate_psqi_score, calculate_ess_score, calculate_stop_bang_score};

/// A declarative sleep quality concern rule.
pub struct SleepQualityRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All sleep quality rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<SleepQualityRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        SleepQualityRule {
            id: "SLP-001",
            category: "PSQI",
            description: "PSQI global score >15 - very poor sleep quality",
            concern_level: "high",
            evaluate: |d| calculate_psqi_score(d) > 15,
        },
        SleepQualityRule {
            id: "SLP-002",
            category: "ESS",
            description: "ESS score >=16 - severe excessive daytime sleepiness",
            concern_level: "high",
            evaluate: |d| calculate_ess_score(d) >= 16,
        },
        SleepQualityRule {
            id: "SLP-003",
            category: "Apnoea",
            description: "STOP-BANG score >=5 - high risk for obstructive sleep apnoea",
            concern_level: "high",
            evaluate: |d| calculate_stop_bang_score(d) >= 5,
        },
        SleepQualityRule {
            id: "SLP-004",
            category: "Apnoea",
            description: "Witnessed apnoeas with loud snoring - urgent OSA assessment needed",
            concern_level: "high",
            evaluate: |d| {
                d.sleep_apnoea_screening.witnessed_apnoeas == "yes"
                    && d.sleep_apnoea_screening.loud_snoring == "yes"
            },
        },
        SleepQualityRule {
            id: "SLP-005",
            category: "Safety",
            description: "Driving safety concern - sleepiness affecting driving (rated <=2/5)",
            concern_level: "high",
            evaluate: |d| matches!(d.impact_assessment.driving_safety, Some(1..=2)),
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        SleepQualityRule {
            id: "SLP-006",
            category: "PSQI",
            description: "PSQI global score 11-15 - poor sleep quality",
            concern_level: "medium",
            evaluate: |d| {
                let score = calculate_psqi_score(d);
                score >= 11 && score <= 15
            },
        },
        SleepQualityRule {
            id: "SLP-007",
            category: "ESS",
            description: "ESS score 11-15 - moderate excessive daytime sleepiness",
            concern_level: "medium",
            evaluate: |d| {
                let score = calculate_ess_score(d);
                score >= 11 && score <= 15
            },
        },
        SleepQualityRule {
            id: "SLP-008",
            category: "Apnoea",
            description: "STOP-BANG score 3-4 - intermediate risk for OSA",
            concern_level: "medium",
            evaluate: |d| {
                let score = calculate_stop_bang_score(d);
                score >= 3 && score <= 4
            },
        },
        SleepQualityRule {
            id: "SLP-009",
            category: "Efficiency",
            description: "Sleep efficiency below 75%",
            concern_level: "medium",
            evaluate: |d| d.sleep_habits.sleep_efficiency.is_some_and(|e| e < 75),
        },
        SleepQualityRule {
            id: "SLP-010",
            category: "Latency",
            description: "Sleep latency exceeds 60 minutes",
            concern_level: "medium",
            evaluate: |d| d.sleep_habits.sleep_latency_minutes.is_some_and(|m| m > 60),
        },
        SleepQualityRule {
            id: "SLP-011",
            category: "Medication",
            description: "Long-term sleep medication use",
            concern_level: "medium",
            evaluate: |d| {
                !d.medical_medications.sleep_medications.is_empty()
                    && d.medical_medications.sleep_medications != "none"
                    && (d.medical_medications.medication_duration == "moreThan6Months"
                        || d.medical_medications.medication_duration == "moreThan12Months")
            },
        },
        SleepQualityRule {
            id: "SLP-012",
            category: "Shift Work",
            description: "Shift work affecting sleep patterns",
            concern_level: "medium",
            evaluate: |d| d.medical_medications.shift_work == "yes",
        },
        SleepQualityRule {
            id: "SLP-013",
            category: "Pain",
            description: "Chronic pain condition affecting sleep",
            concern_level: "medium",
            evaluate: |d| d.medical_medications.chronic_pain_condition == "yes",
        },
        SleepQualityRule {
            id: "SLP-014",
            category: "Restless Legs",
            description: "Significant restless legs symptoms (rated 2-3)",
            concern_level: "medium",
            evaluate: |d| matches!(d.sleep_disturbances.leg_restlessness, Some(2..=3)),
        },
        SleepQualityRule {
            id: "SLP-015",
            category: "Nightmares",
            description: "Frequent nightmares (rated 2-3)",
            concern_level: "medium",
            evaluate: |d| matches!(d.sleep_disturbances.nightmares, Some(2..=3)),
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        SleepQualityRule {
            id: "SLP-016",
            category: "PSQI",
            description: "PSQI global score <=5 - good sleep quality",
            concern_level: "low",
            evaluate: |d| {
                let score = calculate_psqi_score(d);
                score > 0 && score <= 5
            },
        },
        SleepQualityRule {
            id: "SLP-017",
            category: "ESS",
            description: "ESS score <=6 - normal daytime sleepiness",
            concern_level: "low",
            evaluate: |d| {
                let score = calculate_ess_score(d);
                // Only fire if some ESS items answered
                let items = super::utils::collect_ess_items(d);
                let answered = items.iter().filter(|x| x.is_some()).count();
                answered > 0 && score <= 6
            },
        },
        SleepQualityRule {
            id: "SLP-018",
            category: "Hygiene",
            description: "Good sleep hygiene practices",
            concern_level: "low",
            evaluate: |d| {
                d.sleep_hygiene.regular_schedule == "yes"
                    && d.sleep_hygiene.caffeine_late_use == "no"
                    && d.sleep_hygiene.alcohol_before_bed == "no"
                    && d.sleep_hygiene.bed_used_for_sleep_only == "yes"
            },
        },
        SleepQualityRule {
            id: "SLP-019",
            category: "Medication",
            description: "No sleep medication use",
            concern_level: "low",
            evaluate: |d| {
                d.medical_medications.sleep_medications.is_empty()
                    || d.medical_medications.sleep_medications == "none"
            },
        },
        SleepQualityRule {
            id: "SLP-020",
            category: "Schedule",
            description: "Regular sleep schedule maintained",
            concern_level: "low",
            evaluate: |d| d.sleep_hygiene.regular_schedule == "yes",
        },
    ]
}
