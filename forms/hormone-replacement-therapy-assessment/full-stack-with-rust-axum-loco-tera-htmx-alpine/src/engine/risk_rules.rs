use super::types::AssessmentData;
use super::utils::symptom_burden_score;

/// A declarative HRT risk assessment rule.
pub struct RiskRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All HRT risk rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<RiskRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        RiskRule {
            id: "HRT-001",
            category: "Medical History",
            description: "Personal history of breast cancer - HRT generally contraindicated",
            concern_level: "high",
            evaluate: |d| d.breast_health.personal_breast_cancer_history == "yes",
        },
        RiskRule {
            id: "HRT-002",
            category: "Medical History",
            description: "Active or history of venous thromboembolism (VTE)",
            concern_level: "high",
            evaluate: |d| d.medical_history.history_of_vte == "yes",
        },
        RiskRule {
            id: "HRT-003",
            category: "Medical History",
            description: "History of stroke or transient ischaemic attack",
            concern_level: "high",
            evaluate: |d| d.medical_history.history_of_stroke == "yes",
        },
        RiskRule {
            id: "HRT-004",
            category: "Medical History",
            description: "Undiagnosed vaginal bleeding requires investigation before HRT",
            concern_level: "high",
            evaluate: |d| d.medical_history.undiagnosed_vaginal_bleeding == "yes",
        },
        RiskRule {
            id: "HRT-005",
            category: "Medical History",
            description: "Active liver disease - oral HRT contraindicated",
            concern_level: "high",
            evaluate: |d| d.medical_history.liver_disease == "yes",
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        RiskRule {
            id: "HRT-006",
            category: "Cardiovascular",
            description: "Current smoker - increased cardiovascular risk with HRT",
            concern_level: "medium",
            evaluate: |d| d.cardiovascular_risk.smoking_status == "current",
        },
        RiskRule {
            id: "HRT-007",
            category: "Cardiovascular",
            description: "BMI in obese range - consider transdermal route",
            concern_level: "medium",
            evaluate: |d| d.cardiovascular_risk.bmi_category == "obese",
        },
        RiskRule {
            id: "HRT-008",
            category: "Cardiovascular",
            description: "Uncontrolled hypertension - stabilise before HRT initiation",
            concern_level: "medium",
            evaluate: |d| d.cardiovascular_risk.blood_pressure_status == "uncontrolledHigh",
        },
        RiskRule {
            id: "HRT-009",
            category: "Breast Health",
            description: "First-degree family history of breast cancer - enhanced surveillance needed",
            concern_level: "medium",
            evaluate: |d| d.breast_health.family_breast_cancer_history == "firstDegree",
        },
        RiskRule {
            id: "HRT-010",
            category: "Breast Health",
            description: "BRCA gene mutation carrier - specialist referral required",
            concern_level: "medium",
            evaluate: |d| d.breast_health.brca_gene_status == "positive",
        },
        RiskRule {
            id: "HRT-011",
            category: "Medical History",
            description: "History of myocardial infarction - cardiovascular risk assessment needed",
            concern_level: "medium",
            evaluate: |d| d.medical_history.history_of_mi == "yes",
        },
        RiskRule {
            id: "HRT-012",
            category: "Medical History",
            description: "Migraine with aura - avoid oral oestrogen, consider transdermal",
            concern_level: "medium",
            evaluate: |d| d.medical_history.migraine_with_aura == "yes",
        },
        RiskRule {
            id: "HRT-013",
            category: "Medical History",
            description: "Active endometriosis - progestogen-containing regimen required",
            concern_level: "medium",
            evaluate: |d| d.medical_history.endometriosis == "yes",
        },
        RiskRule {
            id: "HRT-014",
            category: "Cardiovascular",
            description: "High cholesterol - lipid monitoring recommended during HRT",
            concern_level: "medium",
            evaluate: |d| d.cardiovascular_risk.cholesterol_status == "high",
        },
        RiskRule {
            id: "HRT-015",
            category: "Medical History",
            description: "Diabetes present - metabolic monitoring required during HRT",
            concern_level: "medium",
            evaluate: |d| d.medical_history.diabetes == "yes",
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        RiskRule {
            id: "HRT-016",
            category: "Symptoms",
            description: "Severe symptom burden (>75%) - strong indication for HRT",
            concern_level: "low",
            evaluate: |d| symptom_burden_score(d).is_some_and(|s| s > 75.0),
        },
        RiskRule {
            id: "HRT-017",
            category: "Bone Health",
            description: "Osteoporosis on DEXA scan - HRT provides bone protection",
            concern_level: "low",
            evaluate: |d| d.bone_health.dexa_scan_result == "osteoporosis",
        },
        RiskRule {
            id: "HRT-018",
            category: "Menstrual History",
            description: "Premature menopause (<40 years) - HRT recommended until average menopause age",
            concern_level: "low",
            evaluate: |d| d.menstrual_history.age_at_menopause == "under40",
        },
        RiskRule {
            id: "HRT-019",
            category: "Menstrual History",
            description: "Surgical menopause - may benefit from prompt HRT initiation",
            concern_level: "low",
            evaluate: |d| d.menstrual_history.menopause_type == "surgical",
        },
        RiskRule {
            id: "HRT-020",
            category: "Counselling",
            description: "Informed consent obtained and patient preference documented",
            concern_level: "low",
            evaluate: |d| {
                d.hrt_options_counselling.informed_consent_obtained == "yes"
                    && d.hrt_options_counselling.patient_preference_noted == "yes"
            },
        },
    ]
}
