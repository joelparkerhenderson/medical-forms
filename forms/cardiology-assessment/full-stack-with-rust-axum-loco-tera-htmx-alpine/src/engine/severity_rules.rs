use super::types::AssessmentData;
use super::utils::count_risk_factors;

/// A declarative severity concern rule.
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
        // ─── HIGH CONCERN ────────────────────────────────────────
        SeverityRule {
            id: "CARD-001",
            category: "Heart Failure",
            description: "LVEF <35% indicating severe heart failure",
            concern_level: "high",
            evaluate: |d| matches!(d.echocardiography.lvef, Some(0..=34)),
        },
        SeverityRule {
            id: "CARD-002",
            category: "Functional Status",
            description: "NYHA class IV - severe limitation of activity",
            concern_level: "high",
            evaluate: |d| d.symptoms_assessment.nyha_class == "IV",
        },
        SeverityRule {
            id: "CARD-003",
            category: "ACS Risk",
            description: "Acute chest pain present - ACS risk assessment required",
            concern_level: "high",
            evaluate: |d| {
                d.symptoms_assessment.chest_pain == "yes"
                    && d.symptoms_assessment.chest_pain_type == "typical"
            },
        },
        SeverityRule {
            id: "CARD-004",
            category: "Arrhythmia",
            description: "New atrial fibrillation with rapid ventricular rate",
            concern_level: "high",
            evaluate: |d| {
                d.cardiac_history.atrial_fibrillation == "yes"
                    && d.physical_examination.heart_rhythm == "irregular"
                    && matches!(d.physical_examination.heart_rate, Some(100..=255))
            },
        },
        SeverityRule {
            id: "CARD-005",
            category: "Syncope",
            description: "Syncope with structural heart disease - risk of sudden cardiac death",
            concern_level: "high",
            evaluate: |d| {
                d.symptoms_assessment.syncope == "yes"
                    && (d.cardiac_history.heart_failure == "yes"
                        || d.cardiac_history.valvular_disease != ""
                        && d.cardiac_history.valvular_disease != "none"
                        || matches!(d.echocardiography.lvef, Some(0..=49)))
            },
        },
        // ─── MEDIUM CONCERN ──────────────────────────────────────
        SeverityRule {
            id: "CARD-006",
            category: "Heart Failure",
            description: "LVEF 35-49% indicating mildly to moderately reduced function",
            concern_level: "medium",
            evaluate: |d| matches!(d.echocardiography.lvef, Some(35..=49)),
        },
        SeverityRule {
            id: "CARD-007",
            category: "Functional Status",
            description: "NYHA class III - marked limitation of physical activity",
            concern_level: "medium",
            evaluate: |d| d.symptoms_assessment.nyha_class == "III",
        },
        SeverityRule {
            id: "CARD-008",
            category: "ECG",
            description: "ST changes present on ECG",
            concern_level: "medium",
            evaluate: |d| d.ecg_findings.st_changes == "yes",
        },
        SeverityRule {
            id: "CARD-009",
            category: "Valvular",
            description: "Significant valvular disease identified",
            concern_level: "medium",
            evaluate: |d| {
                d.echocardiography.valvular_abnormality == "yes"
                    && (d.echocardiography.aortic_valve != "normal"
                        && !d.echocardiography.aortic_valve.is_empty()
                        || d.echocardiography.mitral_valve != "normal"
                            && !d.echocardiography.mitral_valve.is_empty())
            },
        },
        SeverityRule {
            id: "CARD-010",
            category: "Hypertension",
            description: "Uncontrolled hypertension (systolic >= 160 mmHg)",
            concern_level: "medium",
            evaluate: |d| {
                d.physical_examination
                    .blood_pressure_systolic
                    .is_some_and(|s| s >= 160.0)
            },
        },
        SeverityRule {
            id: "CARD-011",
            category: "Biomarker",
            description: "Elevated troponin suggesting myocardial injury",
            concern_level: "medium",
            evaluate: |d| d.investigations.troponin.is_some_and(|t| t > 14.0),
        },
        SeverityRule {
            id: "CARD-012",
            category: "Biomarker",
            description: "Elevated BNP suggesting heart failure",
            concern_level: "medium",
            evaluate: |d| d.investigations.bnp.is_some_and(|b| b > 100.0),
        },
        SeverityRule {
            id: "CARD-013",
            category: "Physical Exam",
            description: "New murmur detected on examination",
            concern_level: "medium",
            evaluate: |d| d.physical_examination.murmur == "yes",
        },
        SeverityRule {
            id: "CARD-014",
            category: "Risk Factors",
            description: "Multiple cardiovascular risk factors present (>=4)",
            concern_level: "medium",
            evaluate: |d| count_risk_factors(d) >= 4,
        },
        SeverityRule {
            id: "CARD-015",
            category: "Renal",
            description: "Chronic kidney disease with heart failure",
            concern_level: "medium",
            evaluate: |d| {
                !d.risk_factors.chronic_kidney_disease.is_empty()
                    && d.risk_factors.chronic_kidney_disease != "none"
                    && d.cardiac_history.heart_failure == "yes"
            },
        },
        // ─── LOW CONCERN ─────────────────────────────────────────
        SeverityRule {
            id: "CARD-016",
            category: "Heart Failure",
            description: "LVEF >= 50% indicating preserved systolic function",
            concern_level: "low",
            evaluate: |d| matches!(d.echocardiography.lvef, Some(50..=100)),
        },
        SeverityRule {
            id: "CARD-017",
            category: "Functional Status",
            description: "NYHA class I - no limitation of physical activity",
            concern_level: "low",
            evaluate: |d| d.symptoms_assessment.nyha_class == "I",
        },
        SeverityRule {
            id: "CARD-018",
            category: "ECG",
            description: "Normal ECG findings",
            concern_level: "low",
            evaluate: |d| {
                d.ecg_findings.ecg_rhythm == "sinusRhythm"
                    && d.ecg_findings.st_changes != "yes"
                    && d.ecg_findings.lvh != "yes"
                    && (d.ecg_findings.bundle_branch_block.is_empty()
                        || d.ecg_findings.bundle_branch_block == "none")
            },
        },
        SeverityRule {
            id: "CARD-019",
            category: "Risk Factors",
            description: "Well-controlled risk factors (<=1 present)",
            concern_level: "low",
            evaluate: |d| count_risk_factors(d) <= 1,
        },
        SeverityRule {
            id: "CARD-020",
            category: "Treatment",
            description: "Stable on current cardiac treatment regimen",
            concern_level: "low",
            evaluate: |d| {
                // At least 2 cardiac medications prescribed and clinician confirms stable
                let med_count = [
                    &d.current_treatment.beta_blocker,
                    &d.current_treatment.ace_inhibitor,
                    &d.current_treatment.statin,
                    &d.current_treatment.diuretic,
                ]
                .iter()
                .filter(|m| **m == "yes")
                .count();

                med_count >= 2
                    && d.clinical_review.urgency == "routine"
            },
        },
    ]
}
