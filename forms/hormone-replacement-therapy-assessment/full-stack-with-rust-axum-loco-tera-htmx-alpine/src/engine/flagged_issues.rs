use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the risk score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── FLAG-VTE-001: VTE history with oral HRT preference ──
    if data.medical_history.history_of_vte == "yes"
        && data.hrt_options_counselling.preferred_hrt_route == "oral"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-VTE-001".to_string(),
            category: "Thrombosis Risk".to_string(),
            message: "VTE history with oral HRT preference - transdermal route strongly recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-BREAST-001: BRCA positive ──────────────────────
    if data.breast_health.brca_gene_status == "positive" {
        flags.push(AdditionalFlag {
            id: "FLAG-BREAST-001".to_string(),
            category: "Breast Cancer Risk".to_string(),
            message: "BRCA gene mutation carrier - oncology referral before HRT initiation".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-BREAST-002: Overdue mammogram ──────────────────
    if data.breast_health.last_mammogram_date == "moreThan2Years"
        || data.breast_health.last_mammogram_date == "never"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-BREAST-002".to_string(),
            category: "Breast Screening".to_string(),
            message: "Mammogram overdue or never performed - arrange before HRT initiation".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-BLEED-001: Undiagnosed vaginal bleeding ────────
    if data.medical_history.undiagnosed_vaginal_bleeding == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-BLEED-001".to_string(),
            category: "Gynaecology".to_string(),
            message: "Undiagnosed vaginal bleeding - investigate before initiating HRT".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-CV-001: Multiple cardiovascular risk factors ───
    let cv_count = [
        data.cardiovascular_risk.smoking_status == "current",
        data.cardiovascular_risk.bmi_category == "obese",
        data.cardiovascular_risk.blood_pressure_status == "uncontrolledHigh",
        data.cardiovascular_risk.cholesterol_status == "high",
        data.cardiovascular_risk.family_history_cvd == "yes",
    ]
    .iter()
    .filter(|&&x| x)
    .count();

    if cv_count >= 3 {
        flags.push(AdditionalFlag {
            id: "FLAG-CV-001".to_string(),
            category: "Cardiovascular".to_string(),
            message: "Multiple cardiovascular risk factors - cardiology review recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-CV-002: Smoker with oral HRT ───────────────────
    if data.cardiovascular_risk.smoking_status == "current"
        && data.hrt_options_counselling.preferred_hrt_route == "oral"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CV-002".to_string(),
            category: "Cardiovascular".to_string(),
            message: "Current smoker requesting oral HRT - discuss transdermal alternative".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-BONE-001: Osteoporosis with high fall risk ─────
    if data.bone_health.dexa_scan_result == "osteoporosis"
        && data.bone_health.fall_risk_assessment == Some(4)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-BONE-001".to_string(),
            category: "Bone Health".to_string(),
            message: "Osteoporosis with high fall risk - urgent fracture prevention needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-BONE-002: Vitamin D deficiency ─────────────────
    if data.bone_health.vitamin_d_status == "deficient" {
        flags.push(AdditionalFlag {
            id: "FLAG-BONE-002".to_string(),
            category: "Bone Health".to_string(),
            message: "Vitamin D deficiency - supplement before or alongside HRT".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-MENO-001: Premature menopause without HRT ─────
    if data.menstrual_history.age_at_menopause == "under40"
        && data.menstrual_history.previous_hrt_use == "no"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MENO-001".to_string(),
            category: "Menopause".to_string(),
            message: "Premature menopause without prior HRT - long-term health risks if untreated".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-MENO-002: Severe symptoms impacting daily life ─
    if data.menopausal_symptoms.symptom_impact_on_daily_life == Some(5) {
        flags.push(AdditionalFlag {
            id: "FLAG-MENO-002".to_string(),
            category: "Symptom Severity".to_string(),
            message: "Severe impact on daily life - expedited treatment initiation recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-CONSENT-001: Consent not obtained ──────────────
    if data.hrt_options_counselling.informed_consent_obtained == "no" {
        flags.push(AdditionalFlag {
            id: "FLAG-CONSENT-001".to_string(),
            category: "Consent".to_string(),
            message: "Informed consent not yet obtained - required before prescribing".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-LIVER-001: Liver disease with oral preference ──
    if data.medical_history.liver_disease == "yes"
        && data.hrt_options_counselling.preferred_hrt_route == "oral"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-LIVER-001".to_string(),
            category: "Hepatic".to_string(),
            message: "Liver disease - oral HRT contraindicated, transdermal route required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-DRUG-001: Drug allergies reported ──────────────
    if !data.current_medications.drug_allergies.trim().is_empty()
        && data.current_medications.drug_allergies != "none"
        && data.current_medications.drug_allergies != "None"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-DRUG-001".to_string(),
            category: "Medications".to_string(),
            message: "Drug allergies reported - verify HRT preparation compatibility".to_string(),
            priority: "low".to_string(),
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
