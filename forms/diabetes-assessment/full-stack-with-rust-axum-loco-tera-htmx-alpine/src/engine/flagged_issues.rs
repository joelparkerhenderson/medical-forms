use super::types::{AdditionalFlag, AssessmentData};
use super::utils::hba1c_mmol_mol;

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the control score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── FLAG-HBA1C-001: HbA1c critically elevated ──────────
    if hba1c_mmol_mol(data).is_some_and(|v| v >= 97.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-HBA1C-001".to_string(),
            category: "Glycaemic Control".to_string(),
            message: "HbA1c critically elevated (>= 97 mmol/mol / >= 11%) - urgent review required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-HBA1C-002: HbA1c above target ─────────────────
    if let (Some(hba1c), Some(target)) = (
        data.glycaemic_control.hba1c_value,
        data.glycaemic_control.hba1c_target,
    ) {
        if hba1c > target && data.glycaemic_control.hba1c_unit != "" {
            flags.push(AdditionalFlag {
                id: "FLAG-HBA1C-002".to_string(),
                category: "Glycaemic Control".to_string(),
                message: "HbA1c above agreed target without treatment intensification".to_string(),
                priority: "medium".to_string(),
            });
        }
    }

    // ─── FLAG-HYPO-001: Severe hypoglycaemia ─────────────────
    if data.glycaemic_control.severe_hypoglycaemia == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-HYPO-001".to_string(),
            category: "Hypoglycaemia".to_string(),
            message: "Severe hypoglycaemia reported - review insulin/sulfonylurea dosing".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-HYPO-002: Hypoglycaemia unawareness ────────────
    if data.glycaemic_control.hypoglycaemia_frequency == "daily"
        && data.glycaemic_control.severe_hypoglycaemia == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-HYPO-002".to_string(),
            category: "Hypoglycaemia".to_string(),
            message: "Possible hypoglycaemia unawareness - consider specialist referral".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-FOOT-001: Active foot ulcer ────────────────────
    if data.foot_assessment.ulcer_present == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-FOOT-001".to_string(),
            category: "Foot".to_string(),
            message: "Active foot ulcer - urgent podiatry referral required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-FOOT-002: High-risk foot ───────────────────────
    if data.foot_assessment.foot_risk_category == "high" {
        flags.push(AdditionalFlag {
            id: "FLAG-FOOT-002".to_string(),
            category: "Foot".to_string(),
            message: "High-risk foot category - ensure annual specialist foot screening".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-EYE-001: Proliferative retinopathy ─────────────
    if data.complications_screening.retinopathy_status == "proliferative" {
        flags.push(AdditionalFlag {
            id: "FLAG-EYE-001".to_string(),
            category: "Eye".to_string(),
            message: "Proliferative retinopathy - urgent ophthalmology referral".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-EYE-002: Overdue eye screening ─────────────────
    if data.complications_screening.last_eye_screening.is_empty() {
        flags.push(AdditionalFlag {
            id: "FLAG-EYE-002".to_string(),
            category: "Eye".to_string(),
            message: "No eye screening date recorded - may be overdue".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-RENAL-001: eGFR rapidly declining ──────────────
    if data.complications_screening.egfr.is_some_and(|v| v < 30.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-RENAL-001".to_string(),
            category: "Renal".to_string(),
            message: "eGFR < 30 - consider nephrology referral and medication review".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-RENAL-002: Macroalbuminuria ────────────────────
    if data.complications_screening.urine_acr.is_some_and(|v| v > 30.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-RENAL-002".to_string(),
            category: "Renal".to_string(),
            message: "Macroalbuminuria detected (ACR > 30) - optimise renoprotective therapy".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-CVD-001: Previous CVD without optimal prevention
    if data.cardiovascular_risk.previous_cvd_event == "yes"
        && (data.cardiovascular_risk.on_statin != "yes"
            || data.cardiovascular_risk.on_antihypertensive != "yes")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CVD-001".to_string(),
            category: "Cardiovascular".to_string(),
            message: "Previous CVD event without optimal secondary prevention (statin/antihypertensive)".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-PSYCH-001: Severe distress/depression ──────────
    if matches!(data.psychological_wellbeing.diabetes_distress, Some(5))
        || matches!(data.psychological_wellbeing.depression_screening, Some(8..=10))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-PSYCH-001".to_string(),
            category: "Psychological".to_string(),
            message: "Severe diabetes distress or depression - consider psychological support referral".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-MED-001: Insulin without hypo education ────────
    if data.medications.insulin == "yes"
        && data.glycaemic_control.hypoglycaemia_frequency.is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-001".to_string(),
            category: "Medication".to_string(),
            message: "On insulin without documented hypoglycaemia assessment - review education".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-SELF-001: Poor self-care across domains ────────
    let poor_diet = matches!(data.self_care_lifestyle.diet_adherence, Some(1..=2));
    let sedentary = data.self_care_lifestyle.physical_activity == "sedentary"
        || data.self_care_lifestyle.physical_activity == "minimal";
    let poor_adherence = matches!(data.medications.medication_adherence, Some(1..=2));
    let poor_domains = [poor_diet, sedentary, poor_adherence]
        .iter()
        .filter(|&&x| x)
        .count();
    if poor_domains >= 2 {
        flags.push(AdditionalFlag {
            id: "FLAG-SELF-001".to_string(),
            category: "Self-Care".to_string(),
            message: "Poor self-care across multiple domains - consider structured education programme".to_string(),
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
