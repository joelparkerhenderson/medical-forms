use super::types::{AdditionalFlag, AssessmentData};
use super::utils::{has_severe_hypertension, calculate_bmi};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the eligibility level. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── VTE risk present ────────────────────────────────────
    if data.medical_history.vte_history == "yes"
        || data.medical_history.vte_family_history == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-VTE-001".to_string(),
            category: "VTE".to_string(),
            message: "VTE risk identified - avoid combined hormonal contraception".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Migraine with aura ──────────────────────────────────
    if data.cardiovascular_risk.migraine_with_aura == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-MIGRAINE-001".to_string(),
            category: "Cardiovascular".to_string(),
            message: "Migraine with aura - UKMEC 4 for COC, patch, ring".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Uncontrolled hypertension ───────────────────────────
    if has_severe_hypertension(data) {
        flags.push(AdditionalFlag {
            id: "FLAG-BP-001".to_string(),
            category: "Cardiovascular".to_string(),
            message: "Severe hypertension (>=160/100) - CHC contraindicated".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── BMI >35 ─────────────────────────────────────────────
    if calculate_bmi(data).is_some_and(|b| b > 35.0) || data.smoking_bmi.bmi_over_35 == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-BMI-001".to_string(),
            category: "BMI".to_string(),
            message: "BMI >35 - increased VTE risk with CHC methods".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Breastfeeding considerations ────────────────────────
    if data.reproductive_history.breastfeeding == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-BF-001".to_string(),
            category: "Breastfeeding".to_string(),
            message: "Currently breastfeeding - consider progestogen-only or non-hormonal methods".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Drug interactions ───────────────────────────────────
    if data.current_medications.rifampicin_rifabutin == "yes"
        || data.current_medications.anticonvulsants == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-DRUG-001".to_string(),
            category: "Medication".to_string(),
            message: "Enzyme-inducing drugs may reduce hormonal contraceptive efficacy".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── STI screening needed ────────────────────────────────
    if data.reproductive_history.current_sti_risk == "yes"
        && data.reproductive_history.last_sti_screen_date.is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-STI-001".to_string(),
            category: "Sexual Health".to_string(),
            message: "STI risk identified but no recent screening - recommend STI testing".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Cervical screening overdue ──────────────────────────
    if data.clinical_review.cervical_screening_status == "overdue" {
        flags.push(AdditionalFlag {
            id: "FLAG-CERV-001".to_string(),
            category: "Screening".to_string(),
            message: "Cervical screening overdue - recommend scheduling".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Current breast cancer ───────────────────────────────
    if data.medical_history.breast_cancer_current == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-CANCER-001".to_string(),
            category: "Oncology".to_string(),
            message: "Current breast cancer - all hormonal methods contraindicated".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Liver disease active ────────────────────────────────
    if data.medical_history.liver_disease == "active" {
        flags.push(AdditionalFlag {
            id: "FLAG-LIVER-001".to_string(),
            category: "Hepatic".to_string(),
            message: "Active liver disease - avoid hormonal contraception".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Diabetes with complications ─────────────────────────
    if data.medical_history.diabetes_complications == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-DM-001".to_string(),
            category: "Metabolic".to_string(),
            message: "Diabetes with vascular complications - CHC contraindicated".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Smoker over 35 ──────────────────────────────────────
    if data.smoking_bmi.age_over_35_smoking == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SMOKE-001".to_string(),
            category: "Lifestyle".to_string(),
            message: "Smoker aged >35 - UKMEC 3/4 for CHC depending on cigarettes/day".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Ectopic pregnancy history ───────────────────────────
    if data.reproductive_history.ectopic_history == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-ECTOPIC-001".to_string(),
            category: "Reproductive".to_string(),
            message: "Previous ectopic pregnancy - counsel on method-specific ectopic risk".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── No consent documented ───────────────────────────────
    if data.counselling.consent_obtained != "yes"
        && !data.clinical_review.method_chosen.is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CONSENT-001".to_string(),
            category: "Governance".to_string(),
            message: "Method chosen but consent not documented - ensure informed consent".to_string(),
            priority: "medium".to_string(),
        });
    }

    // Sort: high > medium > low
    flags.sort_by_key(|f| match f.priority.as_str() {
        "high" => 0,
        "medium" => 1,
        "low" => 2,
        _ => 3,
    });

    flags
}
