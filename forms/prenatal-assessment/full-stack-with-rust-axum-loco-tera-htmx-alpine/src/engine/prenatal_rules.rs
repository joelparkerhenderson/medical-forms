use super::types::AssessmentData;
use super::utils::{mental_health_risk_score, obstetric_risk_score};

/// A declarative prenatal risk rule.
pub struct PrenatalRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All prenatal rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<PrenatalRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        PrenatalRule {
            id: "PRE-001",
            category: "Blood Pressure",
            description: "Severe hypertension: systolic >= 160 or diastolic >= 110",
            concern_level: "high",
            evaluate: |d| {
                matches!(d.physical_examination.blood_pressure_systolic, Some(s) if s >= 160)
                    || matches!(d.physical_examination.blood_pressure_diastolic, Some(v) if v >= 110)
            },
        },
        PrenatalRule {
            id: "PRE-002",
            category: "Obstetric History",
            description: "Previous stillbirth reported",
            concern_level: "high",
            evaluate: |d| d.obstetric_history.previous_stillbirth == "yes",
        },
        PrenatalRule {
            id: "PRE-003",
            category: "Screening",
            description: "Structural abnormalities detected on ultrasound",
            concern_level: "high",
            evaluate: |d| d.ultrasound_findings.structural_abnormalities == "detected",
        },
        PrenatalRule {
            id: "PRE-004",
            category: "Mental Health",
            description: "PHQ-2 score >= 5 indicating significant depression risk",
            concern_level: "high",
            evaluate: |d| matches!(d.mental_health_wellbeing.phq2_score, Some(5..=6)),
        },
        PrenatalRule {
            id: "PRE-005",
            category: "Safeguarding",
            description: "Safeguarding concerns identified",
            concern_level: "high",
            evaluate: |d| d.clinical_review.safeguarding_concerns == "yes",
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        PrenatalRule {
            id: "PRE-006",
            category: "Blood Pressure",
            description: "Moderate hypertension: systolic 140-159 or diastolic 90-109",
            concern_level: "medium",
            evaluate: |d| {
                let systolic_moderate = matches!(d.physical_examination.blood_pressure_systolic, Some(140..=159));
                let diastolic_moderate = matches!(d.physical_examination.blood_pressure_diastolic, Some(90..=109));
                (systolic_moderate || diastolic_moderate)
                    && !matches!(d.physical_examination.blood_pressure_systolic, Some(s) if s >= 160)
                    && !matches!(d.physical_examination.blood_pressure_diastolic, Some(v) if v >= 110)
            },
        },
        PrenatalRule {
            id: "PRE-007",
            category: "Obstetric History",
            description: "Previous preterm birth reported",
            concern_level: "medium",
            evaluate: |d| d.obstetric_history.previous_preterm_birth == "yes",
        },
        PrenatalRule {
            id: "PRE-008",
            category: "Obstetric History",
            description: "Previous preeclampsia reported",
            concern_level: "medium",
            evaluate: |d| d.obstetric_history.previous_preeclampsia == "yes",
        },
        PrenatalRule {
            id: "PRE-009",
            category: "BMI",
            description: "BMI >= 35 (obese class II or higher)",
            concern_level: "medium",
            evaluate: |d| matches!(d.physical_examination.bmi, Some(b) if b >= 35.0),
        },
        PrenatalRule {
            id: "PRE-010",
            category: "Pregnancy",
            description: "Multiple pregnancy (twins or higher order)",
            concern_level: "medium",
            evaluate: |d| matches!(d.current_pregnancy.pregnancy_type.as_str(), "twins" | "triplets" | "higherOrder"),
        },
        PrenatalRule {
            id: "PRE-011",
            category: "Anaemia",
            description: "Haemoglobin below 105 g/L indicating anaemia",
            concern_level: "medium",
            evaluate: |d| matches!(d.blood_tests.haemoglobin, Some(h) if h < 105.0),
        },
        PrenatalRule {
            id: "PRE-012",
            category: "Screening",
            description: "High-risk combined screening result",
            concern_level: "medium",
            evaluate: |d| d.antenatal_screening.combined_screening_result == "highRisk",
        },
        PrenatalRule {
            id: "PRE-013",
            category: "Mental Health",
            description: "PHQ-2 score 3-4 indicating possible depression",
            concern_level: "medium",
            evaluate: |d| matches!(d.mental_health_wellbeing.phq2_score, Some(3..=4)),
        },
        PrenatalRule {
            id: "PRE-014",
            category: "Mental Health",
            description: "GAD-2 score >= 3 indicating anxiety risk",
            concern_level: "medium",
            evaluate: |d| matches!(d.mental_health_wellbeing.gad2_score, Some(3..=6)),
        },
        PrenatalRule {
            id: "PRE-015",
            category: "Proteinuria",
            description: "Significant proteinuria detected (1+ or greater)",
            concern_level: "medium",
            evaluate: |d| matches!(d.physical_examination.proteinuria.as_str(), "1plus" | "2plus" | "3plus"),
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        PrenatalRule {
            id: "PRE-016",
            category: "Obstetric History",
            description: "No previous obstetric complications",
            concern_level: "low",
            evaluate: |d| obstetric_risk_score(d).is_some_and(|s| s == 0.0),
        },
        PrenatalRule {
            id: "PRE-017",
            category: "Mental Health",
            description: "No mental health concerns identified (PHQ-2 and GAD-2 both < 3)",
            concern_level: "low",
            evaluate: |d| mental_health_risk_score(d).is_some_and(|s| s == 0.0),
        },
        PrenatalRule {
            id: "PRE-018",
            category: "Physical Examination",
            description: "Blood pressure within normal range (< 140/90)",
            concern_level: "low",
            evaluate: |d| {
                matches!(d.physical_examination.blood_pressure_systolic, Some(s) if s < 140)
                    && matches!(d.physical_examination.blood_pressure_diastolic, Some(v) if v < 90)
            },
        },
        PrenatalRule {
            id: "PRE-019",
            category: "Screening",
            description: "All screening results normal or low risk",
            concern_level: "low",
            evaluate: |d| {
                let results = [
                    &d.antenatal_screening.combined_screening_result,
                    &d.antenatal_screening.anomaly_scan_result,
                    &d.antenatal_screening.nipt_result,
                ];
                let answered: Vec<&&String> = results.iter().filter(|r| !r.is_empty()).collect();
                !answered.is_empty() && answered.iter().all(|r| matches!(r.as_str(), "normal" | "lowRisk" | "negative"))
            },
        },
        PrenatalRule {
            id: "PRE-020",
            category: "Clinical Review",
            description: "Clinical overall risk rated low (1-2 on 5-point scale)",
            concern_level: "low",
            evaluate: |d| matches!(d.clinical_review.overall_risk_assessment, Some(1..=2)),
        },
    ]
}
