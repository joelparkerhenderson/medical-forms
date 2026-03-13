use super::types::AssessmentData;
use super::utils::calculate_ipss_total;

/// A declarative urology severity concern rule.
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
            id: "URO-001",
            category: "PSA",
            description: "PSA level exceeds 20 ng/mL - urgent investigation required",
            concern_level: "high",
            evaluate: |d| d.prostate_assessment.psa_level.is_some_and(|v| v > 20.0),
        },
        SeverityRule {
            id: "URO-002",
            category: "Cancer",
            description: "Active urological cancer with bone pain - urgent review",
            concern_level: "high",
            evaluate: |d| {
                !d.urological_cancers.cancer_type.is_empty()
                    && d.urological_cancers.cancer_type != "none"
                    && d.urological_cancers.bone_pain == "yes"
            },
        },
        SeverityRule {
            id: "URO-003",
            category: "Haematuria",
            description: "Visible haematuria reported - urgent investigation needed",
            concern_level: "high",
            evaluate: |d| d.lower_urinary_tract.haematuria == "visible",
        },
        SeverityRule {
            id: "URO-004",
            category: "Renal",
            description: "eGFR below 15 - renal failure, urgent nephrology input",
            concern_level: "high",
            evaluate: |d| d.renal_function.egfr.is_some_and(|v| v < 15),
        },
        SeverityRule {
            id: "URO-005",
            category: "Retention",
            description: "Urinary retention reported - acute assessment required",
            concern_level: "high",
            evaluate: |d| d.lower_urinary_tract.urinary_retention == "acute",
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        SeverityRule {
            id: "URO-006",
            category: "IPSS",
            description: "Severe IPSS score (20-35) - significant urinary symptoms",
            concern_level: "medium",
            evaluate: |d| calculate_ipss_total(d).is_some_and(|v| v >= 20),
        },
        SeverityRule {
            id: "URO-007",
            category: "PSA",
            description: "PSA level 4-20 ng/mL - elevated, further assessment needed",
            concern_level: "medium",
            evaluate: |d| {
                d.prostate_assessment
                    .psa_level
                    .is_some_and(|v| v >= 4.0 && v <= 20.0)
            },
        },
        SeverityRule {
            id: "URO-008",
            category: "PSA",
            description: "Rising PSA velocity reported - monitor closely",
            concern_level: "medium",
            evaluate: |d| d.prostate_assessment.psa_velocity == "rising",
        },
        SeverityRule {
            id: "URO-009",
            category: "Renal",
            description: "eGFR 15-29 - severe renal impairment",
            concern_level: "medium",
            evaluate: |d| d.renal_function.egfr.is_some_and(|v| v >= 15 && v <= 29),
        },
        SeverityRule {
            id: "URO-010",
            category: "Renal",
            description: "Hydronephrosis detected on imaging",
            concern_level: "medium",
            evaluate: |d| d.renal_function.hydronephrosis == "yes",
        },
        SeverityRule {
            id: "URO-011",
            category: "Stone",
            description: "Stone size exceeds 10mm - intervention likely required",
            concern_level: "medium",
            evaluate: |d| d.stone_disease.stone_size_mm.is_some_and(|v| v > 10),
        },
        SeverityRule {
            id: "URO-012",
            category: "Stone",
            description: "Severe renal colic pain (8-10) reported",
            concern_level: "medium",
            evaluate: |d| d.stone_disease.current_pain_level.is_some_and(|v| v >= 8),
        },
        SeverityRule {
            id: "URO-013",
            category: "Cancer",
            description: "Unexplained weight loss with urological presentation",
            concern_level: "medium",
            evaluate: |d| d.urological_cancers.unexplained_weight_loss == "yes",
        },
        SeverityRule {
            id: "URO-014",
            category: "Haematuria",
            description: "Non-visible haematuria detected - further investigation",
            concern_level: "medium",
            evaluate: |d| d.lower_urinary_tract.haematuria == "nonVisible",
        },
        SeverityRule {
            id: "URO-015",
            category: "Prostate",
            description: "Abnormal DRE findings - further assessment needed",
            concern_level: "medium",
            evaluate: |d| d.prostate_assessment.dre_findings == "abnormal",
        },
        // ─── LOW CONCERN ────────────────────────────────────────
        SeverityRule {
            id: "URO-016",
            category: "IPSS",
            description: "Mild IPSS score (0-7) - watchful waiting appropriate",
            concern_level: "low",
            evaluate: |d| calculate_ipss_total(d).is_some_and(|v| v <= 7),
        },
        SeverityRule {
            id: "URO-017",
            category: "PSA",
            description: "PSA level within normal range (below 4 ng/mL)",
            concern_level: "low",
            evaluate: |d| d.prostate_assessment.psa_level.is_some_and(|v| v < 4.0),
        },
        SeverityRule {
            id: "URO-018",
            category: "Renal",
            description: "eGFR above 60 - renal function adequate",
            concern_level: "low",
            evaluate: |d| d.renal_function.egfr.is_some_and(|v| v >= 60),
        },
        SeverityRule {
            id: "URO-019",
            category: "IPSS",
            description: "Good quality of life score (0-1) despite symptoms",
            concern_level: "low",
            evaluate: |d| {
                d.urinary_symptoms.quality_of_life.is_some_and(|v| v <= 1)
            },
        },
        SeverityRule {
            id: "URO-020",
            category: "Cancer",
            description: "No active cancer and stable surveillance",
            concern_level: "low",
            evaluate: |d| {
                (d.urological_cancers.cancer_type.is_empty()
                    || d.urological_cancers.cancer_type == "none")
                    && (d.urological_cancers.surveillance_status.is_empty()
                        || d.urological_cancers.surveillance_status == "stable"
                        || d.urological_cancers.surveillance_status == "none")
            },
        },
    ]
}
