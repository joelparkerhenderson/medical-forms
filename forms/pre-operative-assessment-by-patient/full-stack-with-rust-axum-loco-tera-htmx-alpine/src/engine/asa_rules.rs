use super::types::{AsaGrade, AssessmentData};
use super::utils::calculate_age;

/// A declarative ASA grading rule.
pub struct AsaRule {
    pub id: &'static str,
    pub system: &'static str,
    pub description: &'static str,
    pub grade: AsaGrade,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All 42 ASA rules, ported from the frontend engine.
pub fn all_rules() -> Vec<AsaRule> {
    vec![
        // ─── CARDIOVASCULAR ──────────────────────────────────────
        AsaRule {
            id: "CV-001",
            system: "Cardiovascular",
            description: "Controlled hypertension",
            grade: 2,
            evaluate: |d| {
                d.cardiovascular.hypertension == "yes"
                    && d.cardiovascular.hypertension_controlled == "yes"
            },
        },
        AsaRule {
            id: "CV-002",
            system: "Cardiovascular",
            description: "Uncontrolled hypertension",
            grade: 3,
            evaluate: |d| {
                d.cardiovascular.hypertension == "yes"
                    && d.cardiovascular.hypertension_controlled == "no"
            },
        },
        AsaRule {
            id: "CV-003",
            system: "Cardiovascular",
            description: "Stable ischaemic heart disease",
            grade: 2,
            evaluate: |d| {
                d.cardiovascular.ischemic_heart_disease == "yes"
                    && d.cardiovascular.recent_mi != "yes"
            },
        },
        AsaRule {
            id: "CV-004",
            system: "Cardiovascular",
            description: "Recent myocardial infarction (<3 months)",
            grade: 4,
            evaluate: |d| {
                d.cardiovascular.recent_mi == "yes"
                    && d.cardiovascular
                        .recent_mi_weeks
                        .map_or(false, |w| w < 12.0)
            },
        },
        AsaRule {
            id: "CV-005",
            system: "Cardiovascular",
            description: "Heart failure NYHA I-II",
            grade: 2,
            evaluate: |d| {
                d.cardiovascular.heart_failure == "yes"
                    && (d.cardiovascular.heart_failure_nyha == "1"
                        || d.cardiovascular.heart_failure_nyha == "2")
            },
        },
        AsaRule {
            id: "CV-006",
            system: "Cardiovascular",
            description: "Heart failure NYHA III",
            grade: 3,
            evaluate: |d| {
                d.cardiovascular.heart_failure == "yes"
                    && d.cardiovascular.heart_failure_nyha == "3"
            },
        },
        AsaRule {
            id: "CV-007",
            system: "Cardiovascular",
            description: "Heart failure NYHA IV",
            grade: 4,
            evaluate: |d| {
                d.cardiovascular.heart_failure == "yes"
                    && d.cardiovascular.heart_failure_nyha == "4"
            },
        },
        AsaRule {
            id: "CV-008",
            system: "Cardiovascular",
            description: "Valvular heart disease",
            grade: 3,
            evaluate: |d| d.cardiovascular.valvular_disease == "yes",
        },
        AsaRule {
            id: "CV-009",
            system: "Cardiovascular",
            description: "Arrhythmia",
            grade: 2,
            evaluate: |d| d.cardiovascular.arrhythmia == "yes",
        },
        AsaRule {
            id: "CV-010",
            system: "Cardiovascular",
            description: "Pacemaker/ICD in situ",
            grade: 2,
            evaluate: |d| d.cardiovascular.pacemaker == "yes",
        },
        // ─── RESPIRATORY ─────────────────────────────────────────
        AsaRule {
            id: "RS-001",
            system: "Respiratory",
            description: "Mild/intermittent asthma",
            grade: 2,
            evaluate: |d| {
                d.respiratory.asthma == "yes"
                    && (d.respiratory.asthma_frequency == "intermittent"
                        || d.respiratory.asthma_frequency == "mild-persistent")
            },
        },
        AsaRule {
            id: "RS-002",
            system: "Respiratory",
            description: "Moderate-severe persistent asthma",
            grade: 3,
            evaluate: |d| {
                d.respiratory.asthma == "yes"
                    && (d.respiratory.asthma_frequency == "moderate-persistent"
                        || d.respiratory.asthma_frequency == "severe-persistent")
            },
        },
        AsaRule {
            id: "RS-003",
            system: "Respiratory",
            description: "Mild COPD",
            grade: 2,
            evaluate: |d| {
                d.respiratory.copd == "yes" && d.respiratory.copd_severity == "mild"
            },
        },
        AsaRule {
            id: "RS-004",
            system: "Respiratory",
            description: "Moderate COPD",
            grade: 3,
            evaluate: |d| {
                d.respiratory.copd == "yes" && d.respiratory.copd_severity == "moderate"
            },
        },
        AsaRule {
            id: "RS-005",
            system: "Respiratory",
            description: "Severe COPD",
            grade: 3,
            evaluate: |d| {
                d.respiratory.copd == "yes" && d.respiratory.copd_severity == "severe"
            },
        },
        AsaRule {
            id: "RS-006",
            system: "Respiratory",
            description: "Obstructive sleep apnoea",
            grade: 2,
            evaluate: |d| d.respiratory.osa == "yes",
        },
        AsaRule {
            id: "RS-007",
            system: "Respiratory",
            description: "Current smoker",
            grade: 2,
            evaluate: |d| d.respiratory.smoking == "current",
        },
        // ─── RENAL ───────────────────────────────────────────────
        AsaRule {
            id: "RN-001",
            system: "Renal",
            description: "CKD Stage 1-3",
            grade: 2,
            evaluate: |d| {
                d.renal.ckd == "yes"
                    && (d.renal.ckd_stage == "1"
                        || d.renal.ckd_stage == "2"
                        || d.renal.ckd_stage == "3")
            },
        },
        AsaRule {
            id: "RN-002",
            system: "Renal",
            description: "CKD Stage 4-5",
            grade: 3,
            evaluate: |d| {
                d.renal.ckd == "yes"
                    && (d.renal.ckd_stage == "4" || d.renal.ckd_stage == "5")
            },
        },
        AsaRule {
            id: "RN-003",
            system: "Renal",
            description: "On dialysis",
            grade: 3,
            evaluate: |d| d.renal.dialysis == "yes",
        },
        // ─── HEPATIC ─────────────────────────────────────────────
        AsaRule {
            id: "HP-001",
            system: "Hepatic",
            description: "Liver disease (non-cirrhotic)",
            grade: 2,
            evaluate: |d| {
                d.hepatic.liver_disease == "yes" && d.hepatic.cirrhosis != "yes"
            },
        },
        AsaRule {
            id: "HP-002",
            system: "Hepatic",
            description: "Cirrhosis Child-Pugh A",
            grade: 3,
            evaluate: |d| {
                d.hepatic.cirrhosis == "yes" && d.hepatic.child_pugh_score == "A"
            },
        },
        AsaRule {
            id: "HP-003",
            system: "Hepatic",
            description: "Cirrhosis Child-Pugh B/C",
            grade: 4,
            evaluate: |d| {
                d.hepatic.cirrhosis == "yes"
                    && (d.hepatic.child_pugh_score == "B"
                        || d.hepatic.child_pugh_score == "C")
            },
        },
        // ─── ENDOCRINE ───────────────────────────────────────────
        AsaRule {
            id: "EN-001",
            system: "Endocrine",
            description: "Well-controlled diabetes",
            grade: 2,
            evaluate: |d| {
                !d.endocrine.diabetes.is_empty()
                    && d.endocrine.diabetes != "none"
                    && d.endocrine.diabetes_control == "well-controlled"
            },
        },
        AsaRule {
            id: "EN-002",
            system: "Endocrine",
            description: "Poorly controlled diabetes",
            grade: 3,
            evaluate: |d| {
                !d.endocrine.diabetes.is_empty()
                    && d.endocrine.diabetes != "none"
                    && d.endocrine.diabetes_control == "poorly-controlled"
            },
        },
        AsaRule {
            id: "EN-003",
            system: "Endocrine",
            description: "Thyroid disease",
            grade: 2,
            evaluate: |d| d.endocrine.thyroid_disease == "yes",
        },
        AsaRule {
            id: "EN-004",
            system: "Endocrine",
            description: "Adrenal insufficiency",
            grade: 3,
            evaluate: |d| d.endocrine.adrenal_insufficiency == "yes",
        },
        // ─── NEUROLOGICAL ────────────────────────────────────────
        AsaRule {
            id: "NR-001",
            system: "Neurological",
            description: "Previous stroke/TIA",
            grade: 3,
            evaluate: |d| d.neurological.stroke_or_tia == "yes",
        },
        AsaRule {
            id: "NR-002",
            system: "Neurological",
            description: "Controlled epilepsy",
            grade: 2,
            evaluate: |d| {
                d.neurological.epilepsy == "yes"
                    && d.neurological.epilepsy_controlled == "yes"
            },
        },
        AsaRule {
            id: "NR-003",
            system: "Neurological",
            description: "Uncontrolled epilepsy",
            grade: 3,
            evaluate: |d| {
                d.neurological.epilepsy == "yes"
                    && d.neurological.epilepsy_controlled == "no"
            },
        },
        AsaRule {
            id: "NR-004",
            system: "Neurological",
            description: "Neuromuscular disease",
            grade: 3,
            evaluate: |d| d.neurological.neuromuscular_disease == "yes",
        },
        AsaRule {
            id: "NR-005",
            system: "Neurological",
            description: "Raised intracranial pressure",
            grade: 4,
            evaluate: |d| d.neurological.raised_icp == "yes",
        },
        // ─── HAEMATOLOGICAL ──────────────────────────────────────
        AsaRule {
            id: "HM-001",
            system: "Haematological",
            description: "Bleeding disorder",
            grade: 3,
            evaluate: |d| d.haematological.bleeding_disorder == "yes",
        },
        AsaRule {
            id: "HM-002",
            system: "Haematological",
            description: "On anticoagulants",
            grade: 2,
            evaluate: |d| d.haematological.on_anticoagulants == "yes",
        },
        AsaRule {
            id: "HM-003",
            system: "Haematological",
            description: "Sickle cell disease",
            grade: 3,
            evaluate: |d| d.haematological.sickle_cell_disease == "yes",
        },
        AsaRule {
            id: "HM-004",
            system: "Haematological",
            description: "Anaemia",
            grade: 2,
            evaluate: |d| d.haematological.anaemia == "yes",
        },
        // ─── OBESITY ─────────────────────────────────────────────
        AsaRule {
            id: "OB-001",
            system: "Obesity",
            description: "BMI 30-39 (Obese)",
            grade: 2,
            evaluate: |d| d.demographics.bmi.map_or(false, |b| b >= 30.0 && b < 40.0),
        },
        AsaRule {
            id: "OB-002",
            system: "Obesity",
            description: "BMI ≥40 (Morbid obesity)",
            grade: 3,
            evaluate: |d| d.demographics.bmi.map_or(false, |b| b >= 40.0),
        },
        // ─── FUNCTIONAL CAPACITY ─────────────────────────────────
        AsaRule {
            id: "FC-001",
            system: "Functional Capacity",
            description: "Poor functional capacity (<4 METs)",
            grade: 3,
            evaluate: |d| {
                d.functional_capacity
                    .estimated_mets
                    .map_or(false, |m| m < 4.0)
            },
        },
        // ─── AGE ─────────────────────────────────────────────────
        AsaRule {
            id: "AG-001",
            system: "Demographics",
            description: "Age >80 years",
            grade: 2,
            evaluate: |d| {
                calculate_age(&d.demographics.date_of_birth).map_or(false, |age| age > 80)
            },
        },
        // ─── SOCIAL HISTORY ──────────────────────────────────────
        AsaRule {
            id: "SH-001",
            system: "Social",
            description: "Heavy alcohol use",
            grade: 2,
            evaluate: |d| d.social_history.alcohol == "heavy",
        },
        AsaRule {
            id: "SH-002",
            system: "Social",
            description: "Recreational drug use",
            grade: 2,
            evaluate: |d| d.social_history.recreational_drugs == "yes",
        },
    ]
}
