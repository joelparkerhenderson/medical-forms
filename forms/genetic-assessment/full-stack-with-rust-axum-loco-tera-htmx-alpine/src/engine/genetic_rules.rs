use super::types::AssessmentData;
use super::utils::{count_affected_family_cancers, count_affected_relatives_under50};

/// A declarative genetic risk rule.
pub struct GeneticRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub weight: u32,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All genetic rules, ordered by concern level (high -> medium -> low).
/// 5 high, 10 medium, 5 low = 20 rules total (GEN-001 through GEN-020).
pub fn all_rules() -> Vec<GeneticRule> {
    vec![
        // ─── HIGH CONCERN (GEN-001 through GEN-005) ──────────────
        GeneticRule {
            id: "GEN-001",
            category: "Pathogenic Variant",
            description: "Confirmed pathogenic variant (BRCA1/2, Lynch, or cardiac gene positive)",
            concern_level: "high",
            weight: 5,
            evaluate: |d| {
                d.cancer_risk_assessment.brca_result == "positive"
                    || d.cancer_risk_assessment.lynch_result == "positive"
                    || d.cardiac_genetic_risk.cardiac_gene_result == "positive"
            },
        },
        GeneticRule {
            id: "GEN-002",
            category: "Family History",
            description: "Multiple affected first/second-degree relatives diagnosed under age 50",
            concern_level: "high",
            weight: 4,
            evaluate: |d| count_affected_relatives_under50(d) >= 2,
        },
        GeneticRule {
            id: "GEN-003",
            category: "Cancer History",
            description: "Bilateral cancer reported",
            concern_level: "high",
            weight: 4,
            evaluate: |d| d.personal_medical_history.bilateral_cancer == "yes",
        },
        GeneticRule {
            id: "GEN-004",
            category: "Reproductive",
            description: "Consanguinity with previously affected child",
            concern_level: "high",
            weight: 5,
            evaluate: |d| {
                d.reproductive_genetics.consanguinity == "yes"
                    && d.reproductive_genetics.previous_affected_child == "yes"
            },
        },
        GeneticRule {
            id: "GEN-005",
            category: "Genetic Testing",
            description: "Known familial variant but patient has not been tested",
            concern_level: "high",
            weight: 4,
            evaluate: |d| {
                d.genetic_testing_status.known_familial_variant == "yes"
                    && d.genetic_testing_status.previous_genetic_tests != "yes"
            },
        },
        // ─── MEDIUM CONCERN (GEN-006 through GEN-015) ────────────
        GeneticRule {
            id: "GEN-006",
            category: "Cancer History",
            description: "Personal cancer diagnosed before age 50",
            concern_level: "medium",
            weight: 3,
            evaluate: |d| {
                d.personal_medical_history.personal_cancer_history == "yes"
                    && d.personal_medical_history.age_at_diagnosis.is_some_and(|a| a < 50)
            },
        },
        GeneticRule {
            id: "GEN-007",
            category: "Cancer History",
            description: "Multiple primary cancers reported",
            concern_level: "medium",
            weight: 3,
            evaluate: |d| d.personal_medical_history.multiple_primary_cancers == "yes",
        },
        GeneticRule {
            id: "GEN-008",
            category: "Family History",
            description: "Three or more family members with cancer across generations",
            concern_level: "medium",
            weight: 3,
            evaluate: |d| count_affected_family_cancers(d) >= 3,
        },
        GeneticRule {
            id: "GEN-009",
            category: "Cancer Risk",
            description: "Manchester score 15 or above (BRCA testing threshold)",
            concern_level: "medium",
            weight: 3,
            evaluate: |d| d.cancer_risk_assessment.manchester_score.is_some_and(|s| s >= 15),
        },
        GeneticRule {
            id: "GEN-010",
            category: "Cardiac",
            description: "Sudden cardiac death reported in family",
            concern_level: "medium",
            weight: 3,
            evaluate: |d| d.cardiac_genetic_risk.sudden_cardiac_death == "yes",
        },
        GeneticRule {
            id: "GEN-011",
            category: "Cardiac",
            description: "Familial hypercholesterolemia identified",
            concern_level: "medium",
            weight: 2,
            evaluate: |d| d.cardiac_genetic_risk.familial_hypercholesterolemia == "yes",
        },
        GeneticRule {
            id: "GEN-012",
            category: "Cardiac",
            description: "Cardiomyopathy or aortic aneurysm in family",
            concern_level: "medium",
            weight: 2,
            evaluate: |d| {
                d.cardiac_genetic_risk.cardiomyopathy == "yes"
                    || d.cardiac_genetic_risk.aortic_aneurysm == "yes"
            },
        },
        GeneticRule {
            id: "GEN-013",
            category: "Reproductive",
            description: "Consanguinity reported",
            concern_level: "medium",
            weight: 3,
            evaluate: |d| d.reproductive_genetics.consanguinity == "yes",
        },
        GeneticRule {
            id: "GEN-014",
            category: "Reproductive",
            description: "Known carrier status for genetic condition",
            concern_level: "medium",
            weight: 2,
            evaluate: |d| d.reproductive_genetics.carrier_status == "yes",
        },
        GeneticRule {
            id: "GEN-015",
            category: "Genetic Testing",
            description: "Variant of uncertain significance (VUS) identified",
            concern_level: "medium",
            weight: 2,
            evaluate: |d| d.genetic_testing_status.variants_of_uncertain_significance == "yes",
        },
        // ─── LOW CONCERN (GEN-016 through GEN-020) ───────────────
        GeneticRule {
            id: "GEN-016",
            category: "Reproductive",
            description: "Recurrent miscarriages reported",
            concern_level: "low",
            weight: 1,
            evaluate: |d| d.reproductive_genetics.recurrent_miscarriages == "yes",
        },
        GeneticRule {
            id: "GEN-017",
            category: "Cardiac",
            description: "Early-onset cardiovascular disease in family",
            concern_level: "low",
            weight: 1,
            evaluate: |d| d.cardiac_genetic_risk.early_onset_cvd == "yes",
        },
        GeneticRule {
            id: "GEN-018",
            category: "Psychological",
            description: "Psychological readiness concerns for predictive testing",
            concern_level: "low",
            weight: 1,
            evaluate: |d| d.psychological_impact.psychological_readiness == "notReady",
        },
        GeneticRule {
            id: "GEN-019",
            category: "Family History",
            description: "Single affected relative with cancer over age 50",
            concern_level: "low",
            weight: 1,
            evaluate: |d| {
                count_affected_family_cancers(d) == 1
                    && count_affected_relatives_under50(d) == 0
            },
        },
        GeneticRule {
            id: "GEN-020",
            category: "Genetic Testing",
            description: "Previous genetic counselling completed",
            concern_level: "low",
            weight: 0,
            evaluate: |d| d.psychological_impact.genetic_counselling == "yes",
        },
    ]
}
