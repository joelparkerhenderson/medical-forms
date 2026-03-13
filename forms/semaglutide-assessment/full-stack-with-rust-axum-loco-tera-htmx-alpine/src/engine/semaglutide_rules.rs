use super::types::AssessmentData;
use super::utils::{clinical_review_score, lifestyle_score};

/// A declarative semaglutide eligibility rule.
pub struct SemaglutideRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All semaglutide rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<SemaglutideRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        SemaglutideRule {
            id: "SEM-001",
            category: "Contraindication",
            description: "Personal or family history of medullary thyroid carcinoma or MEN2",
            concern_level: "high",
            evaluate: |d| {
                d.contraindications.personal_medullary_thyroid_cancer == "yes"
                    || d.contraindications.family_men2 == "yes"
            },
        },
        SemaglutideRule {
            id: "SEM-002",
            category: "Contraindication",
            description: "History of pancreatitis - semaglutide contraindicated",
            concern_level: "high",
            evaluate: |d| d.contraindications.pancreatitis_history == "yes",
        },
        SemaglutideRule {
            id: "SEM-003",
            category: "Contraindication",
            description: "Pregnancy, planning pregnancy, or breastfeeding",
            concern_level: "high",
            evaluate: |d| {
                d.contraindications.pregnancy_or_planning == "yes"
                    || d.contraindications.breastfeeding == "yes"
            },
        },
        SemaglutideRule {
            id: "SEM-004",
            category: "Contraindication",
            description: "Type 1 diabetes - GLP-1 agonists not appropriate",
            concern_level: "high",
            evaluate: |d| d.contraindications.type1_diabetes == "yes",
        },
        SemaglutideRule {
            id: "SEM-005",
            category: "Clinical",
            description: "Clinical review dimension score below 40% - poor candidate",
            concern_level: "high",
            evaluate: |d| clinical_review_score(d).is_some_and(|s| s < 40.0),
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        SemaglutideRule {
            id: "SEM-006",
            category: "BMI",
            description: "BMI below 27 - may not meet prescribing criteria",
            concern_level: "medium",
            evaluate: |d| d.weight_bmi_history.current_bmi.is_some_and(|b| b < 27.0),
        },
        SemaglutideRule {
            id: "SEM-007",
            category: "Medication",
            description: "Currently on another GLP-1 receptor agonist",
            concern_level: "medium",
            evaluate: |d| d.current_medications.other_glp1_agonist == "yes",
        },
        SemaglutideRule {
            id: "SEM-008",
            category: "Medication",
            description: "Concurrent insulin therapy - dose adjustment needed",
            concern_level: "medium",
            evaluate: |d| d.current_medications.insulin_therapy == "yes",
        },
        SemaglutideRule {
            id: "SEM-009",
            category: "Medication",
            description: "Concurrent sulfonylurea - hypoglycaemia risk increased",
            concern_level: "medium",
            evaluate: |d| d.current_medications.sulfonylureas == "yes",
        },
        SemaglutideRule {
            id: "SEM-010",
            category: "Contraindication",
            description: "Severe renal impairment - use with caution",
            concern_level: "medium",
            evaluate: |d| d.contraindications.severe_renal_impairment == "yes",
        },
        SemaglutideRule {
            id: "SEM-011",
            category: "Contraindication",
            description: "Severe GI disease - increased risk of GI side effects",
            concern_level: "medium",
            evaluate: |d| d.contraindications.severe_gi_disease == "yes",
        },
        SemaglutideRule {
            id: "SEM-012",
            category: "Contraindication",
            description: "Known hypersensitivity to semaglutide or excipients",
            concern_level: "medium",
            evaluate: |d| d.contraindications.known_hypersensitivity == "yes",
        },
        SemaglutideRule {
            id: "SEM-013",
            category: "Lifestyle",
            description: "Lifestyle readiness score below 40% - poor adherence risk",
            concern_level: "medium",
            evaluate: |d| lifestyle_score(d).is_some_and(|s| s < 40.0),
        },
        SemaglutideRule {
            id: "SEM-014",
            category: "Consent",
            description: "Informed consent not obtained",
            concern_level: "medium",
            evaluate: |d| {
                !d.informed_consent.consent_given.is_empty()
                    && d.informed_consent.consent_given != "yes"
            },
        },
        SemaglutideRule {
            id: "SEM-015",
            category: "Monitoring",
            description: "Baseline blood tests not completed",
            concern_level: "medium",
            evaluate: |d| {
                !d.monitoring_plan.baseline_bloods_completed.is_empty()
                    && d.monitoring_plan.baseline_bloods_completed != "yes"
            },
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        SemaglutideRule {
            id: "SEM-016",
            category: "BMI",
            description: "BMI >= 35 with comorbidity - strong indication for treatment",
            concern_level: "low",
            evaluate: |d| {
                d.weight_bmi_history.current_bmi.is_some_and(|b| b >= 35.0)
                    && (d.medical_history.type2_diabetes == "yes"
                        || d.medical_history.hypertension == "yes"
                        || d.medical_history.cardiovascular_disease == "yes"
                        || d.medical_history.obstructive_sleep_apnoea == "yes")
            },
        },
        SemaglutideRule {
            id: "SEM-017",
            category: "Clinical",
            description: "All clinical review items rated Good or Excellent (4-5)",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.clinical_review.overall_eligibility_assessment,
                    d.clinical_review.benefit_risk_ratio,
                    d.clinical_review.patient_suitability,
                    d.clinical_review.clinical_confidence,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
        SemaglutideRule {
            id: "SEM-018",
            category: "Lifestyle",
            description: "High motivation and commitment to lifestyle changes (both rated 4-5)",
            concern_level: "low",
            evaluate: |d| {
                matches!(d.lifestyle_assessment.motivation_to_change, Some(4..=5))
                    && matches!(d.treatment_goals.commitment_to_lifestyle_changes, Some(4..=5))
            },
        },
        SemaglutideRule {
            id: "SEM-019",
            category: "Consent",
            description: "Full informed consent obtained with all understanding confirmed",
            concern_level: "low",
            evaluate: |d| {
                d.informed_consent.consent_given == "yes"
                    && d.informed_consent.understands_mechanism == "yes"
                    && d.informed_consent.understands_side_effects == "yes"
                    && d.informed_consent.understands_injection_technique == "yes"
                    && d.informed_consent.understands_dose_escalation == "yes"
                    && d.informed_consent.understands_monitoring_requirements == "yes"
            },
        },
        SemaglutideRule {
            id: "SEM-020",
            category: "Monitoring",
            description: "Complete baseline investigations and monitoring plan in place",
            concern_level: "low",
            evaluate: |d| {
                d.monitoring_plan.baseline_bloods_completed == "yes"
                    && d.monitoring_plan.renal_function_checked == "yes"
                    && d.monitoring_plan.thyroid_function_checked == "yes"
                    && d.monitoring_plan.follow_up_interval_weeks.is_some()
            },
        },
    ]
}
