use super::types::AssessmentData;
use super::utils::{count_asrs_positive, functional_impact_score, inattention_score, hyperactivity_score};

/// A declarative ADHD likelihood rule.
pub struct LikelihoodRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All likelihood rules, ordered by concern level (high > medium > low).
pub fn all_rules() -> Vec<LikelihoodRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        LikelihoodRule {
            id: "ADHD-001",
            category: "ASRS Screener",
            description: "ASRS Part A screener has 4 or more positive items - highly consistent with ADHD",
            concern_level: "high",
            evaluate: |d| count_asrs_positive(d) >= 4,
        },
        LikelihoodRule {
            id: "ADHD-002",
            category: "Functional Impact",
            description: "Severe functional impairment (score above 75%)",
            concern_level: "high",
            evaluate: |d| functional_impact_score(d).is_some_and(|s| s > 75.0),
        },
        LikelihoodRule {
            id: "ADHD-003",
            category: "Comorbidity",
            description: "Comorbid current substance use reported",
            concern_level: "high",
            evaluate: |d| d.comorbidities.substance_use_current == "yes",
        },
        LikelihoodRule {
            id: "ADHD-004",
            category: "Safety",
            description: "Driving safety concern reported (rated 3-4, often to very often)",
            concern_level: "high",
            evaluate: |d| matches!(d.functional_impact.driving_safety_concern, Some(3..=4)),
        },
        LikelihoodRule {
            id: "ADHD-005",
            category: "Developmental",
            description: "Childhood symptom onset confirmed with school performance issues",
            concern_level: "high",
            evaluate: |d| {
                d.developmental_history.childhood_symptoms_present == "yes"
                    && d.developmental_history.school_performance_issues == "yes"
            },
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        LikelihoodRule {
            id: "ADHD-006",
            category: "Inattention",
            description: "Inattention dimension score above 50% (moderate to severe)",
            concern_level: "medium",
            evaluate: |d| inattention_score(d).is_some_and(|s| s > 50.0),
        },
        LikelihoodRule {
            id: "ADHD-007",
            category: "Hyperactivity",
            description: "Hyperactivity-impulsivity dimension score above 50%",
            concern_level: "medium",
            evaluate: |d| hyperactivity_score(d).is_some_and(|s| s > 50.0),
        },
        LikelihoodRule {
            id: "ADHD-008",
            category: "Functional Impact",
            description: "Relationship impact rated often or very often (3-4)",
            concern_level: "medium",
            evaluate: |d| matches!(d.functional_impact.relationship_impact, Some(3..=4)),
        },
        LikelihoodRule {
            id: "ADHD-009",
            category: "Functional Impact",
            description: "Work/academic performance significantly impacted (rated 3-4)",
            concern_level: "medium",
            evaluate: |d| {
                matches!(d.functional_impact.work_performance_impact, Some(3..=4))
                    || matches!(d.functional_impact.academic_impact, Some(3..=4))
            },
        },
        LikelihoodRule {
            id: "ADHD-010",
            category: "Comorbidity",
            description: "Anxiety symptoms reported",
            concern_level: "medium",
            evaluate: |d| d.comorbidities.anxiety_symptoms == "yes",
        },
        LikelihoodRule {
            id: "ADHD-011",
            category: "Comorbidity",
            description: "Depression symptoms reported",
            concern_level: "medium",
            evaluate: |d| d.comorbidities.depression_symptoms == "yes",
        },
        LikelihoodRule {
            id: "ADHD-012",
            category: "Comorbidity",
            description: "Sleep disorder reported",
            concern_level: "medium",
            evaluate: |d| d.comorbidities.sleep_disorder == "yes",
        },
        LikelihoodRule {
            id: "ADHD-013",
            category: "Developmental",
            description: "Childhood symptoms present but no formal school reports available",
            concern_level: "medium",
            evaluate: |d| {
                d.developmental_history.childhood_symptoms_present == "yes"
                    && d.developmental_history.school_behavior_reports != "yes"
            },
        },
        LikelihoodRule {
            id: "ADHD-014",
            category: "Management",
            description: "Cardiac history requires screening before stimulant medication",
            concern_level: "medium",
            evaluate: |d| {
                d.current_management.cardiac_history == "yes"
                    || d.current_management.family_cardiac_history == "yes"
            },
        },
        LikelihoodRule {
            id: "ADHD-015",
            category: "Functional Impact",
            description: "Self-esteem significantly impacted (rated 3-4)",
            concern_level: "medium",
            evaluate: |d| matches!(d.functional_impact.self_esteem_impact, Some(3..=4)),
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        LikelihoodRule {
            id: "ADHD-016",
            category: "ASRS Screener",
            description: "ASRS Part A screener has fewer than 2 positive items",
            concern_level: "low",
            evaluate: |d| {
                let positive = count_asrs_positive(d);
                let items = super::utils::collect_asrs_items(d);
                let answered = items.iter().filter(|x| x.is_some()).count();
                answered >= 6 && positive < 2
            },
        },
        LikelihoodRule {
            id: "ADHD-017",
            category: "Functional Impact",
            description: "Functional impact score below 25% - minimal impairment",
            concern_level: "low",
            evaluate: |d| functional_impact_score(d).is_some_and(|s| s < 25.0),
        },
        LikelihoodRule {
            id: "ADHD-018",
            category: "Developmental",
            description: "No childhood symptoms reported",
            concern_level: "low",
            evaluate: |d| d.developmental_history.childhood_symptoms_present == "no",
        },
        LikelihoodRule {
            id: "ADHD-019",
            category: "Management",
            description: "Currently on medication with reported effectiveness",
            concern_level: "low",
            evaluate: |d| {
                d.current_management.currently_on_medication == "yes"
                    && matches!(d.current_management.medication_effectiveness, Some(3..=4))
            },
        },
        LikelihoodRule {
            id: "ADHD-020",
            category: "Comorbidity",
            description: "No comorbid psychiatric conditions identified",
            concern_level: "low",
            evaluate: |d| {
                d.comorbidities.anxiety_symptoms != "yes"
                    && d.comorbidities.depression_symptoms != "yes"
                    && d.comorbidities.mood_disorder_history != "yes"
                    && d.comorbidities.substance_use_current != "yes"
                    && d.comorbidities.autism_spectrum_traits != "yes"
            },
        },
    ]
}
