use super::types::AssessmentData;
use super::utils::{calculate_mmse_score, orientation_score, recall_score, attention_score, functional_score};

/// A declarative cognitive concern rule.
pub struct CognitiveRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All cognitive rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<CognitiveRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        CognitiveRule {
            id: "COG-001",
            category: "MMSE",
            description: "MMSE score below 10 - severe cognitive impairment",
            concern_level: "high",
            evaluate: |d| calculate_mmse_score(d).is_some_and(|s| s < 10),
        },
        CognitiveRule {
            id: "COG-002",
            category: "Decline",
            description: "Rapid cognitive decline reported (weeks to months)",
            concern_level: "high",
            evaluate: |d| d.cognitive_history.rate_of_decline == "rapid",
        },
        CognitiveRule {
            id: "COG-003",
            category: "Safety",
            description: "Safety awareness impaired (score 0)",
            concern_level: "high",
            evaluate: |d| d.functional_assessment.safety_awareness == Some(0),
        },
        CognitiveRule {
            id: "COG-004",
            category: "Safety",
            description: "Wandering risk - disoriented to place (orientation place score 0-1)",
            concern_level: "high",
            evaluate: |d| {
                let place_items = [
                    d.orientation.orientation_country,
                    d.orientation.orientation_county,
                    d.orientation.orientation_city,
                    d.orientation.orientation_building,
                    d.orientation.orientation_floor,
                ];
                let answered: Vec<u8> = place_items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().sum::<u8>() <= 1
            },
        },
        CognitiveRule {
            id: "COG-005",
            category: "Functional",
            description: "Unable to self-care - personal hygiene score 0",
            concern_level: "high",
            evaluate: |d| d.functional_assessment.personal_hygiene == Some(0),
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        CognitiveRule {
            id: "COG-006",
            category: "MMSE",
            description: "MMSE score 10-18 - moderate cognitive impairment",
            concern_level: "medium",
            evaluate: |d| calculate_mmse_score(d).is_some_and(|s| (10..=18).contains(&s)),
        },
        CognitiveRule {
            id: "COG-007",
            category: "Orientation",
            description: "Orientation score 5 or less out of 10 - significant disorientation",
            concern_level: "medium",
            evaluate: |d| orientation_score(d).is_some_and(|s| s <= 5),
        },
        CognitiveRule {
            id: "COG-008",
            category: "Recall",
            description: "Recall score 0 out of 3 - complete failure of delayed recall",
            concern_level: "medium",
            evaluate: |d| recall_score(d) == Some(0),
        },
        CognitiveRule {
            id: "COG-009",
            category: "Attention",
            description: "Attention score 0-1 out of 5 - severely impaired attention",
            concern_level: "medium",
            evaluate: |d| attention_score(d).is_some_and(|s| s <= 1),
        },
        CognitiveRule {
            id: "COG-010",
            category: "Language",
            description: "Unable to name common objects (naming score 0)",
            concern_level: "medium",
            evaluate: |d| {
                d.language.naming_pencil == Some(0) && d.language.naming_watch == Some(0)
            },
        },
        CognitiveRule {
            id: "COG-011",
            category: "Functional",
            description: "Cannot manage medications independently",
            concern_level: "medium",
            evaluate: |d| d.functional_assessment.medication_management == Some(0),
        },
        CognitiveRule {
            id: "COG-012",
            category: "Functional",
            description: "Cannot manage finances independently",
            concern_level: "medium",
            evaluate: |d| d.functional_assessment.financial_management == Some(0),
        },
        CognitiveRule {
            id: "COG-013",
            category: "Functional",
            description: "Cannot use transport independently",
            concern_level: "medium",
            evaluate: |d| d.functional_assessment.transport_ability == Some(0),
        },
        CognitiveRule {
            id: "COG-014",
            category: "Executive",
            description: "Verbal fluency score 0 - severe executive dysfunction",
            concern_level: "medium",
            evaluate: |d| d.executive_function.verbal_fluency_score == Some(0),
        },
        CognitiveRule {
            id: "COG-015",
            category: "Visuospatial",
            description: "Clock drawing failed (all components score 0)",
            concern_level: "medium",
            evaluate: |d| {
                d.visuospatial.clock_drawing_contour == Some(0)
                    && d.visuospatial.clock_drawing_numbers == Some(0)
                    && d.visuospatial.clock_drawing_hands == Some(0)
            },
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        CognitiveRule {
            id: "COG-016",
            category: "MMSE",
            description: "MMSE score 24 or above - normal cognitive function",
            concern_level: "low",
            evaluate: |d| calculate_mmse_score(d).is_some_and(|s| s >= 24),
        },
        CognitiveRule {
            id: "COG-017",
            category: "Orientation",
            description: "Full orientation (10/10) - intact temporal and spatial awareness",
            concern_level: "low",
            evaluate: |d| orientation_score(d) == Some(10),
        },
        CognitiveRule {
            id: "COG-018",
            category: "Recall",
            description: "Full recall (3/3) - intact delayed memory",
            concern_level: "low",
            evaluate: |d| recall_score(d) == Some(3),
        },
        CognitiveRule {
            id: "COG-019",
            category: "Functional",
            description: "Fully independent in all functional activities",
            concern_level: "low",
            evaluate: |d| functional_score(d) == Some(7),
        },
        CognitiveRule {
            id: "COG-020",
            category: "Decline",
            description: "Cognitive status stable or improving",
            concern_level: "low",
            evaluate: |d| {
                d.cognitive_history.rate_of_decline == "stable"
                    || d.cognitive_history.rate_of_decline == "improving"
            },
        },
    ]
}
