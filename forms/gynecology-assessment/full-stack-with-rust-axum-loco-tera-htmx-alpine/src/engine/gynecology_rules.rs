use super::types::AssessmentData;
use super::utils::{menopause_score, symptom_severity_score};

/// A declarative gynecology assessment rule.
pub struct GynecologyRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All gynecology rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<GynecologyRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        GynecologyRule {
            id: "GYN-001",
            category: "Malignancy",
            description: "Suspected malignancy - abnormal symptoms with risk factors",
            concern_level: "high",
            evaluate: |d| {
                d.breast_health.breast_symptoms == "lump"
                    && d.breast_health.family_breast_cancer == "yes"
            },
        },
        GynecologyRule {
            id: "GYN-002",
            category: "Pain",
            description: "Severe pelvic pain (rated 5/5)",
            concern_level: "high",
            evaluate: |d| d.gynecological_symptoms.pelvic_pain_severity == Some(5),
        },
        GynecologyRule {
            id: "GYN-003",
            category: "Bleeding",
            description: "Postmenopausal bleeding reported",
            concern_level: "high",
            evaluate: |d| {
                d.menopause_assessment.menopausal_status == "postmenopausal"
                    && d.menstrual_history.intermenstrual_bleeding == "yes"
            },
        },
        GynecologyRule {
            id: "GYN-004",
            category: "Cervical",
            description: "Abnormal cervical screening result",
            concern_level: "high",
            evaluate: |d| {
                d.cervical_screening.smear_result == "abnormal"
                    || d.cervical_screening.smear_result == "highGrade"
            },
        },
        GynecologyRule {
            id: "GYN-005",
            category: "Safeguarding",
            description: "Domestic violence disclosed",
            concern_level: "high",
            evaluate: |d| d.sexual_health.domestic_violence_screening == "yes",
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        GynecologyRule {
            id: "GYN-006",
            category: "Pain",
            description: "Moderate to severe pelvic pain (rated 3-4/5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.gynecological_symptoms.pelvic_pain_severity, Some(3..=4)),
        },
        GynecologyRule {
            id: "GYN-007",
            category: "Menstrual",
            description: "Severe dysmenorrhoea (rated 4-5/5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.gynecological_symptoms.dysmenorrhoea, Some(4..=5)),
        },
        GynecologyRule {
            id: "GYN-008",
            category: "Symptoms",
            description: "Dyspareunia reported",
            concern_level: "medium",
            evaluate: |d| d.gynecological_symptoms.dyspareunia == "yes",
        },
        GynecologyRule {
            id: "GYN-009",
            category: "Menstrual",
            description: "Intermenstrual bleeding reported",
            concern_level: "medium",
            evaluate: |d| d.menstrual_history.intermenstrual_bleeding == "yes",
        },
        GynecologyRule {
            id: "GYN-010",
            category: "Symptoms",
            description: "Prolapse symptoms reported",
            concern_level: "medium",
            evaluate: |d| d.gynecological_symptoms.prolapse_symptoms == "yes",
        },
        GynecologyRule {
            id: "GYN-011",
            category: "Fertility",
            description: "Fertility concerns with desire for future pregnancy",
            concern_level: "medium",
            evaluate: |d| {
                d.contraception_fertility.fertility_concerns == "yes"
                    && d.contraception_fertility.future_fertility_wishes == "yes"
            },
        },
        GynecologyRule {
            id: "GYN-012",
            category: "Menopause",
            description: "Severe vasomotor symptoms (rated 4-5/5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.menopause_assessment.vasomotor_symptoms, Some(4..=5)),
        },
        GynecologyRule {
            id: "GYN-013",
            category: "Breast",
            description: "Breast symptoms reported requiring investigation",
            concern_level: "medium",
            evaluate: |d| {
                !d.breast_health.breast_symptoms.is_empty()
                    && d.breast_health.breast_symptoms != "none"
            },
        },
        GynecologyRule {
            id: "GYN-014",
            category: "STI",
            description: "Current sexual health concerns reported",
            concern_level: "medium",
            evaluate: |d| {
                !d.sexual_health.current_concerns.is_empty()
                    && d.sexual_health.current_concerns != "none"
            },
        },
        GynecologyRule {
            id: "GYN-015",
            category: "Menopause",
            description: "Menopause symptom dimension score above 75%",
            concern_level: "medium",
            evaluate: |d| menopause_score(d).is_some_and(|s| s > 75.0),
        },
        // ─── LOW CONCERN / POSITIVE ─────────────────────────────
        GynecologyRule {
            id: "GYN-016",
            category: "Screening",
            description: "Cervical screening up to date with normal result",
            concern_level: "low",
            evaluate: |d| {
                !d.cervical_screening.last_smear_date.is_empty()
                    && d.cervical_screening.smear_result == "normal"
            },
        },
        GynecologyRule {
            id: "GYN-017",
            category: "Symptoms",
            description: "No significant gynecological symptoms (pain rated 1/5)",
            concern_level: "low",
            evaluate: |d| d.gynecological_symptoms.pelvic_pain_severity == Some(1),
        },
        GynecologyRule {
            id: "GYN-018",
            category: "Contraception",
            description: "Satisfied with current contraception method",
            concern_level: "low",
            evaluate: |d| d.contraception_fertility.satisfaction == "satisfied",
        },
        GynecologyRule {
            id: "GYN-019",
            category: "Symptoms",
            description: "All symptom severity scores below 25%",
            concern_level: "low",
            evaluate: |d| symptom_severity_score(d).is_some_and(|s| s < 25.0),
        },
        GynecologyRule {
            id: "GYN-020",
            category: "Management",
            description: "Management plan documented with follow-up arranged",
            concern_level: "low",
            evaluate: |d| {
                !d.clinical_review.management_plan.is_empty()
                    && !d.clinical_review.follow_up.is_empty()
                    && d.clinical_review.follow_up != "none"
            },
        },
    ]
}
