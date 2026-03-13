use super::types::AssessmentData;
use super::utils::{count_alarm_features, upper_gi_score, lower_gi_score};

/// A declarative GI assessment concern rule.
pub struct GiRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All GI rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<GiRule> {
    vec![
        // ─── HIGH CONCERN (GI-001 to GI-005) ─────────────────────
        GiRule {
            id: "GI-001",
            category: "Alarm Features",
            description: "Multiple alarm features present (2 or more)",
            concern_level: "high",
            evaluate: |d| count_alarm_features(d) >= 2,
        },
        GiRule {
            id: "GI-002",
            category: "Weight Loss",
            description: "Unintentional weight loss exceeding 10%",
            concern_level: "high",
            evaluate: |d| {
                d.alarm_features.unintentional_weight_loss == "yes"
                    && d.alarm_features.weight_loss_percentage.is_some_and(|p| p > 10.0)
            },
        },
        GiRule {
            id: "GI-003",
            category: "Dysphagia",
            description: "Progressive dysphagia (grade 3-4) - urgent investigation needed",
            concern_level: "high",
            evaluate: |d| matches!(d.upper_gi_symptoms.dysphagia_grade, Some(3..=4)),
        },
        GiRule {
            id: "GI-004",
            category: "GI Bleeding",
            description: "Active GI bleeding reported",
            concern_level: "high",
            evaluate: |d| d.alarm_features.gi_bleeding == "yes",
        },
        GiRule {
            id: "GI-005",
            category: "Liver",
            description: "Jaundice present - urgent hepatobiliary assessment required",
            concern_level: "high",
            evaluate: |d| d.alarm_features.jaundice == "yes",
        },
        // ─── MEDIUM CONCERN (GI-006 to GI-015) ───────────────────
        GiRule {
            id: "GI-006",
            category: "Upper GI",
            description: "Upper GI symptom severity score above 60%",
            concern_level: "medium",
            evaluate: |d| upper_gi_score(d).is_some_and(|s| s > 60.0),
        },
        GiRule {
            id: "GI-007",
            category: "Lower GI",
            description: "Lower GI symptom severity score above 60%",
            concern_level: "medium",
            evaluate: |d| lower_gi_score(d).is_some_and(|s| s > 60.0),
        },
        GiRule {
            id: "GI-008",
            category: "Rectal Bleeding",
            description: "Rectal bleeding reported with high frequency (3-4)",
            concern_level: "medium",
            evaluate: |d| {
                d.lower_gi_symptoms.rectal_bleeding == "yes"
                    && matches!(d.lower_gi_symptoms.rectal_bleeding_frequency, Some(3..=4))
            },
        },
        GiRule {
            id: "GI-009",
            category: "IBD",
            description: "IBD activity index elevated (3-4) - possible flare",
            concern_level: "medium",
            evaluate: |d| matches!(d.clinical_review.ibd_activity_index, Some(3..=4)),
        },
        GiRule {
            id: "GI-010",
            category: "Nutrition",
            description: "MUST screening score indicates high malnutrition risk (3-4)",
            concern_level: "medium",
            evaluate: |d| matches!(d.nutritional_assessment.must_screening_score, Some(3..=4)),
        },
        GiRule {
            id: "GI-011",
            category: "Liver",
            description: "Elevated liver enzymes - ALT or AST above 100 U/L",
            concern_level: "medium",
            evaluate: |d| {
                d.liver_assessment.alt_u_l.is_some_and(|v| v > 100.0)
                    || d.liver_assessment.ast_u_l.is_some_and(|v| v > 100.0)
            },
        },
        GiRule {
            id: "GI-012",
            category: "Liver",
            description: "Elevated bilirubin above 40 umol/L",
            concern_level: "medium",
            evaluate: |d| d.liver_assessment.bilirubin_umol_l.is_some_and(|v| v > 40.0),
        },
        GiRule {
            id: "GI-013",
            category: "Nutrition",
            description: "Low albumin (below 30 g/L) - nutritional concern",
            concern_level: "medium",
            evaluate: |d| d.nutritional_assessment.albumin_g_l.is_some_and(|v| v < 30.0),
        },
        GiRule {
            id: "GI-014",
            category: "Weight Loss",
            description: "Unintentional weight loss between 5% and 10%",
            concern_level: "medium",
            evaluate: |d| {
                d.alarm_features.unintentional_weight_loss == "yes"
                    && d.alarm_features.weight_loss_percentage.is_some_and(|p| p > 5.0 && p <= 10.0)
            },
        },
        GiRule {
            id: "GI-015",
            category: "Cancer Risk",
            description: "Family history of GI cancer with age over 50 and new symptoms",
            concern_level: "medium",
            evaluate: |d| {
                d.gi_history.family_cancer_history == "yes"
                    && d.alarm_features.age_over_50_new_symptoms == "yes"
            },
        },
        // ─── LOW CONCERN (GI-016 to GI-020) ──────────────────────
        GiRule {
            id: "GI-016",
            category: "GERD",
            description: "Mild GERD symptoms - heartburn frequency and severity both 1",
            concern_level: "low",
            evaluate: |d| {
                d.upper_gi_symptoms.heartburn_frequency == Some(1)
                    && d.upper_gi_symptoms.heartburn_severity == Some(1)
            },
        },
        GiRule {
            id: "GI-017",
            category: "Functional",
            description: "Low severity symptoms with no alarm features - possible IBS",
            concern_level: "low",
            evaluate: |d| {
                count_alarm_features(d) == 0
                    && lower_gi_score(d).is_some_and(|s| s > 0.0 && s <= 25.0)
            },
        },
        GiRule {
            id: "GI-018",
            category: "Quality of Life",
            description: "Minimal quality of life impact (score 0-1)",
            concern_level: "low",
            evaluate: |d| matches!(d.clinical_review.quality_of_life_impact, Some(0..=1)),
        },
        GiRule {
            id: "GI-019",
            category: "Nutrition",
            description: "Normal nutritional status - MUST score 0",
            concern_level: "low",
            evaluate: |d| d.nutritional_assessment.must_screening_score == Some(0),
        },
        GiRule {
            id: "GI-020",
            category: "Liver",
            description: "Normal liver function markers within reference range",
            concern_level: "low",
            evaluate: |d| {
                let alt_ok = d.liver_assessment.alt_u_l.is_none()
                    || d.liver_assessment.alt_u_l.is_some_and(|v| v <= 40.0);
                let ast_ok = d.liver_assessment.ast_u_l.is_none()
                    || d.liver_assessment.ast_u_l.is_some_and(|v| v <= 40.0);
                let alp_ok = d.liver_assessment.alp_u_l.is_none()
                    || d.liver_assessment.alp_u_l.is_some_and(|v| v <= 130.0);
                let bili_ok = d.liver_assessment.bilirubin_umol_l.is_none()
                    || d.liver_assessment.bilirubin_umol_l.is_some_and(|v| v <= 21.0);
                // Only fire if at least one marker was provided
                let has_any = d.liver_assessment.alt_u_l.is_some()
                    || d.liver_assessment.ast_u_l.is_some()
                    || d.liver_assessment.alp_u_l.is_some()
                    || d.liver_assessment.bilirubin_umol_l.is_some();
                has_any && alt_ok && ast_ok && alp_ok && bili_ok
            },
        },
    ]
}
