use super::types::AssessmentData;
use super::utils::{has_severe_hypertension, has_elevated_bp, calculate_bmi};

/// A declarative eligibility concern rule.
pub struct EligibilityRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All eligibility rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<EligibilityRule> {
    vec![
        // ─── HIGH CONCERN (CONT-001 to CONT-005) ─────────────────
        EligibilityRule {
            id: "CONT-001",
            category: "Cardiovascular",
            description: "Migraine with aura - absolute contraindication for COC/CHC",
            concern_level: "high",
            evaluate: |d| d.cardiovascular_risk.migraine_with_aura == "yes",
        },
        EligibilityRule {
            id: "CONT-002",
            category: "VTE",
            description: "Personal history of VTE - absolute contraindication for CHC",
            concern_level: "high",
            evaluate: |d| d.medical_history.vte_history == "yes",
        },
        EligibilityRule {
            id: "CONT-003",
            category: "Cardiovascular",
            description: "Severe hypertension (BP >=160/100) - absolute contraindication for CHC",
            concern_level: "high",
            evaluate: |d| has_severe_hypertension(d),
        },
        EligibilityRule {
            id: "CONT-004",
            category: "Oncology",
            description: "Current breast cancer - absolute contraindication for all hormonal methods",
            concern_level: "high",
            evaluate: |d| d.medical_history.breast_cancer_current == "yes",
        },
        EligibilityRule {
            id: "CONT-005",
            category: "Pregnancy",
            description: "Pregnancy possible or confirmed - contraception assessment inappropriate",
            concern_level: "high",
            evaluate: |d| d.reproductive_history.pregnancy_possible == "yes",
        },
        // ─── MEDIUM CONCERN (CONT-006 to CONT-015) ───────────────
        EligibilityRule {
            id: "CONT-006",
            category: "Cardiovascular",
            description: "Elevated BP (140-159/90-99) - relative contraindication for CHC",
            concern_level: "medium",
            evaluate: |d| has_elevated_bp(d),
        },
        EligibilityRule {
            id: "CONT-007",
            category: "BMI",
            description: "BMI >35 - relative contraindication for CHC methods",
            concern_level: "medium",
            evaluate: |d| {
                calculate_bmi(d).is_some_and(|b| b > 35.0)
                    || d.smoking_bmi.bmi_over_35 == "yes"
            },
        },
        EligibilityRule {
            id: "CONT-008",
            category: "Smoking",
            description: "Smoker aged >35 - relative contraindication for CHC",
            concern_level: "medium",
            evaluate: |d| d.smoking_bmi.age_over_35_smoking == "yes",
        },
        EligibilityRule {
            id: "CONT-009",
            category: "Breastfeeding",
            description: "Currently breastfeeding <6 weeks postpartum - CHC contraindicated",
            concern_level: "medium",
            evaluate: |d| {
                d.reproductive_history.breastfeeding == "yes"
                    && d.reproductive_history.breastfeeding_duration == "lessThan6Weeks"
            },
        },
        EligibilityRule {
            id: "CONT-010",
            category: "Medication",
            description: "Enzyme-inducing drugs (rifampicin/anticonvulsants) affect hormonal efficacy",
            concern_level: "medium",
            evaluate: |d| {
                d.current_medications.rifampicin_rifabutin == "yes"
                    || d.current_medications.anticonvulsants == "yes"
            },
        },
        EligibilityRule {
            id: "CONT-011",
            category: "VTE",
            description: "Family history of VTE - relative contraindication for CHC",
            concern_level: "medium",
            evaluate: |d| d.medical_history.vte_family_history == "yes",
        },
        EligibilityRule {
            id: "CONT-012",
            category: "Cardiovascular",
            description: "Multiple cardiovascular risk factors present",
            concern_level: "medium",
            evaluate: |d| d.cardiovascular_risk.multiple_cv_risk_factors == "yes",
        },
        EligibilityRule {
            id: "CONT-013",
            category: "Oncology",
            description: "History of breast cancer (past, no current disease) - UKMEC 3 for hormonal",
            concern_level: "medium",
            evaluate: |d| {
                d.medical_history.breast_cancer_history == "yes"
                    && d.medical_history.breast_cancer_current != "yes"
            },
        },
        EligibilityRule {
            id: "CONT-014",
            category: "Cardiovascular",
            description: "Migraine without aura aged >35 - relative contraindication for COC",
            concern_level: "medium",
            evaluate: |d| {
                d.cardiovascular_risk.migraine_without_aura == "yes"
                    && d.cardiovascular_risk.migraine_age_over_35 == "yes"
            },
        },
        EligibilityRule {
            id: "CONT-015",
            category: "Medical",
            description: "SLE with antiphospholipid antibodies - CHC contraindicated",
            concern_level: "medium",
            evaluate: |d| d.medical_history.sle_with_antiphospholipid == "yes",
        },
        // ─── LOW CONCERN (CONT-016 to CONT-020) ──────────────────
        EligibilityRule {
            id: "CONT-016",
            category: "Eligibility",
            description: "All methods UKMEC 1 - no restrictions for any contraceptive method",
            concern_level: "low",
            evaluate: |d| {
                let cats = [
                    d.ukmec_eligibility.coc_category,
                    d.ukmec_eligibility.pop_category,
                    d.ukmec_eligibility.patch_ring_category,
                    d.ukmec_eligibility.dmpa_injectable_category,
                    d.ukmec_eligibility.implant_category,
                    d.ukmec_eligibility.lng_ius_category,
                    d.ukmec_eligibility.cu_iud_category,
                    d.ukmec_eligibility.barrier_category,
                ];
                let answered: Vec<u8> = cats.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v == 1)
            },
        },
        EligibilityRule {
            id: "CONT-017",
            category: "Counselling",
            description: "Full counselling completed with consent obtained",
            concern_level: "low",
            evaluate: |d| {
                d.counselling.consent_obtained == "yes"
                    && d.counselling.risks_benefits_discussed == "yes"
                    && d.counselling.side_effects_discussed == "yes"
            },
        },
        EligibilityRule {
            id: "CONT-018",
            category: "Eligibility",
            description: "LARC method chosen - highly effective long-acting method selected",
            concern_level: "low",
            evaluate: |d| {
                matches!(
                    d.clinical_review.method_chosen.as_str(),
                    "implant" | "lngIus" | "cuIud" | "dmpaInjectable"
                )
            },
        },
        EligibilityRule {
            id: "CONT-019",
            category: "Screening",
            description: "Cervical screening up to date",
            concern_level: "low",
            evaluate: |d| d.clinical_review.cervical_screening_status == "upToDate",
        },
        EligibilityRule {
            id: "CONT-020",
            category: "Follow-up",
            description: "Follow-up appointment scheduled within recommended interval",
            concern_level: "low",
            evaluate: |d| !d.clinical_review.follow_up_date.is_empty(),
        },
    ]
}
