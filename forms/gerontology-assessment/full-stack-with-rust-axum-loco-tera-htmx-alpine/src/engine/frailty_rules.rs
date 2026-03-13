use super::types::AssessmentData;
use super::utils::{
    calculate_barthel_score, calculate_gds_score, calculate_mna_score,
    count_katz_dependencies, calculate_tinetti_score,
};

/// A declarative frailty concern rule.
pub struct FrailtyRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All frailty rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<FrailtyRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        FrailtyRule {
            id: "GER-001",
            category: "Frailty",
            description: "Clinical Frailty Scale >= 7 (severely frail or worse)",
            concern_level: "high",
            evaluate: |d| matches!(d.clinical_review.clinical_frailty_scale, Some(7..=9)),
        },
        FrailtyRule {
            id: "GER-002",
            category: "Falls",
            description: "Recurrent falls with injury (>= 2 falls with >= 1 injury)",
            concern_level: "high",
            evaluate: |d| {
                d.falls_risk.falls_last_12_months.unwrap_or(0) >= 2
                    && d.falls_risk.falls_with_injury.unwrap_or(0) >= 1
            },
        },
        FrailtyRule {
            id: "GER-003",
            category: "Cognitive",
            description: "Cognitive impairment with safety risk (MMSE <= 20 with known dementia)",
            concern_level: "high",
            evaluate: |d| {
                d.cognitive_screening.mmse_score.unwrap_or(30) <= 20
                    && d.cognitive_screening.known_dementia_diagnosis == "yes"
            },
        },
        FrailtyRule {
            id: "GER-004",
            category: "Nutrition",
            description: "Malnutrition identified (MNA-SF score <= 7)",
            concern_level: "high",
            evaluate: |d| calculate_mna_score(d).is_some_and(|s| s <= 7),
        },
        FrailtyRule {
            id: "GER-005",
            category: "ADL",
            description: "ADL dependence in >= 5 areas (Katz dependencies)",
            concern_level: "high",
            evaluate: |d| count_katz_dependencies(d) >= 5,
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        FrailtyRule {
            id: "GER-006",
            category: "Frailty",
            description: "Clinical Frailty Scale 5-6 (mildly to moderately frail)",
            concern_level: "medium",
            evaluate: |d| matches!(d.clinical_review.clinical_frailty_scale, Some(5..=6)),
        },
        FrailtyRule {
            id: "GER-007",
            category: "Falls",
            description: "Single fall in last 12 months",
            concern_level: "medium",
            evaluate: |d| d.falls_risk.falls_last_12_months == Some(1),
        },
        FrailtyRule {
            id: "GER-008",
            category: "Polypharmacy",
            description: "Polypharmacy identified (>= 5 medications)",
            concern_level: "medium",
            evaluate: |d| d.medication_review.total_medications.unwrap_or(0) >= 5,
        },
        FrailtyRule {
            id: "GER-009",
            category: "Cognitive",
            description: "Mild cognitive impairment (MMSE 21-24)",
            concern_level: "medium",
            evaluate: |d| matches!(d.cognitive_screening.mmse_score, Some(21..=24)),
        },
        FrailtyRule {
            id: "GER-010",
            category: "Mood",
            description: "Depression indicated by GDS-15 (score >= 5)",
            concern_level: "medium",
            evaluate: |d| calculate_gds_score(d) >= 5,
        },
        FrailtyRule {
            id: "GER-011",
            category: "Nutrition",
            description: "At risk of malnutrition (MNA-SF score 8-11)",
            concern_level: "medium",
            evaluate: |d| calculate_mna_score(d).is_some_and(|s| (8..=11).contains(&s)),
        },
        FrailtyRule {
            id: "GER-012",
            category: "ADL",
            description: "Barthel Index indicates moderate dependence (score 10-14)",
            concern_level: "medium",
            evaluate: |d| {
                let s = calculate_barthel_score(d);
                (10..=14).contains(&s)
            },
        },
        FrailtyRule {
            id: "GER-013",
            category: "Balance",
            description: "Tinetti balance score indicates moderate fall risk (score 6-8)",
            concern_level: "medium",
            evaluate: |d| calculate_tinetti_score(d).is_some_and(|s| (6..=8).contains(&s)),
        },
        FrailtyRule {
            id: "GER-014",
            category: "Continence",
            description: "Urinary incontinence affecting quality of life",
            concern_level: "medium",
            evaluate: |d| {
                d.continence_assessment.urinary_incontinence == "yes"
                    && d.continence_assessment.continence_impact_on_quality == "significant"
            },
        },
        FrailtyRule {
            id: "GER-015",
            category: "Social",
            description: "Social isolation identified with no formal care",
            concern_level: "medium",
            evaluate: |d| {
                d.social_circumstances.lives_alone == "yes"
                    && d.mood_assessment.social_isolation == "yes"
                    && d.social_circumstances.formal_care_package == "no"
            },
        },
        // ─── LOW CONCERN ────────────────────────────────────────
        FrailtyRule {
            id: "GER-016",
            category: "Frailty",
            description: "CFS 1-3 (fit to managing well)",
            concern_level: "low",
            evaluate: |d| matches!(d.clinical_review.clinical_frailty_scale, Some(1..=3)),
        },
        FrailtyRule {
            id: "GER-017",
            category: "ADL",
            description: "Fully independent in all Barthel ADL items (score 20)",
            concern_level: "low",
            evaluate: |d| calculate_barthel_score(d) == 20,
        },
        FrailtyRule {
            id: "GER-018",
            category: "Nutrition",
            description: "Normal nutritional status (MNA-SF score 12-14)",
            concern_level: "low",
            evaluate: |d| calculate_mna_score(d).is_some_and(|s| s >= 12),
        },
        FrailtyRule {
            id: "GER-019",
            category: "Mood",
            description: "No depression indicated by GDS-15 (score 0-4)",
            concern_level: "low",
            evaluate: |d| calculate_gds_score(d) <= 4,
        },
        FrailtyRule {
            id: "GER-020",
            category: "Cognitive",
            description: "Normal cognition (MMSE >= 25)",
            concern_level: "low",
            evaluate: |d| d.cognitive_screening.mmse_score.is_some_and(|s| s >= 25),
        },
    ]
}
