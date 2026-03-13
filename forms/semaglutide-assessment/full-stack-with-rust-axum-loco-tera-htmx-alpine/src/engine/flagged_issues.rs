use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the eligibility score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Thyroid cancer risk ─────────────────────────────────
    if data.contraindications.personal_medullary_thyroid_cancer == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-THYROID-001".to_string(),
            category: "Contraindication".to_string(),
            message: "Personal history of medullary thyroid carcinoma - absolute contraindication".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── MEN2 family history ─────────────────────────────────
    if data.contraindications.family_men2 == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-THYROID-002".to_string(),
            category: "Contraindication".to_string(),
            message: "Family history of MEN2 syndrome - absolute contraindication".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Pancreatitis history ────────────────────────────────
    if data.contraindications.pancreatitis_history == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-PANC-001".to_string(),
            category: "Contraindication".to_string(),
            message: "History of pancreatitis - semaglutide contraindicated".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Pregnancy or breastfeeding ──────────────────────────
    if data.contraindications.pregnancy_or_planning == "yes"
        || data.contraindications.breastfeeding == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-PREG-001".to_string(),
            category: "Contraindication".to_string(),
            message: "Pregnancy, planning pregnancy, or breastfeeding - discontinue semaglutide".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── BMI below threshold ─────────────────────────────────
    if data.weight_bmi_history.current_bmi.is_some_and(|b| b < 27.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-BMI-001".to_string(),
            category: "Eligibility".to_string(),
            message: "BMI below 27 - does not meet minimum prescribing criteria".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── GLP-1 duplication ───────────────────────────────────
    if data.current_medications.other_glp1_agonist == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-001".to_string(),
            category: "Medication".to_string(),
            message: "Already on another GLP-1 agonist - cannot prescribe semaglutide concurrently".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Insulin dose adjustment ─────────────────────────────
    if data.current_medications.insulin_therapy == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-002".to_string(),
            category: "Medication".to_string(),
            message: "Concurrent insulin therapy - monitor for hypoglycaemia, consider dose reduction".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Sulfonylurea interaction ────────────────────────────
    if data.current_medications.sulfonylureas == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-003".to_string(),
            category: "Medication".to_string(),
            message: "Concurrent sulfonylurea - increased hypoglycaemia risk".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Eating disorder ─────────────────────────────────────
    if data.contraindications.eating_disorder == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-PSYCH-001".to_string(),
            category: "Mental Health".to_string(),
            message: "Active eating disorder - weight loss medication may worsen condition".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Low motivation ──────────────────────────────────────
    if matches!(data.lifestyle_assessment.motivation_to_change, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-LIFESTYLE-001".to_string(),
            category: "Lifestyle".to_string(),
            message: "Low motivation to change - discuss readiness before prescribing".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Consent incomplete ──────────────────────────────────
    if !data.informed_consent.consent_given.is_empty()
        && data.informed_consent.consent_given != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CONSENT-001".to_string(),
            category: "Consent".to_string(),
            message: "Informed consent not obtained - cannot proceed with treatment".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Baseline bloods incomplete ──────────────────────────
    if !data.monitoring_plan.baseline_bloods_completed.is_empty()
        && data.monitoring_plan.baseline_bloods_completed != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MONITOR-001".to_string(),
            category: "Monitoring".to_string(),
            message: "Baseline blood tests not completed - required before initiating treatment".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Depression/anxiety comorbidity ──────────────────────
    if data.medical_history.depression_anxiety == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-PSYCH-002".to_string(),
            category: "Mental Health".to_string(),
            message: "Depression/anxiety reported - monitor mental health during treatment".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── Warfarin interaction ────────────────────────────────
    if data.current_medications.warfarin == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-004".to_string(),
            category: "Medication".to_string(),
            message: "Concurrent warfarin - monitor INR closely during dose changes".to_string(),
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
