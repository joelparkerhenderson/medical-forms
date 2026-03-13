use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the severity score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Acute urinary retention ─────────────────────────────
    if data.lower_urinary_tract.urinary_retention == "acute" {
        flags.push(AdditionalFlag {
            id: "FLAG-RET-001".to_string(),
            category: "Retention".to_string(),
            message: "Acute urinary retention - immediate catheterisation may be required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Visible haematuria ──────────────────────────────────
    if data.lower_urinary_tract.haematuria == "visible" {
        flags.push(AdditionalFlag {
            id: "FLAG-HAEM-001".to_string(),
            category: "Haematuria".to_string(),
            message: "Visible haematuria - urgent two-week-wait referral pathway".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Non-visible haematuria ──────────────────────────────
    if data.lower_urinary_tract.haematuria == "nonVisible" {
        flags.push(AdditionalFlag {
            id: "FLAG-HAEM-002".to_string(),
            category: "Haematuria".to_string(),
            message: "Non-visible haematuria detected - cystoscopy and upper tract imaging recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Critical PSA ────────────────────────────────────────
    if data.prostate_assessment.psa_level.is_some_and(|v| v > 20.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-PSA-001".to_string(),
            category: "PSA".to_string(),
            message: "PSA exceeds 20 ng/mL - urgent prostate cancer investigation pathway".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Elevated PSA with abnormal DRE ──────────────────────
    if data.prostate_assessment.psa_level.is_some_and(|v| v >= 4.0)
        && data.prostate_assessment.dre_findings == "abnormal"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-PSA-002".to_string(),
            category: "PSA".to_string(),
            message: "Elevated PSA with abnormal DRE - consider MRI and biopsy".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Renal failure ───────────────────────────────────────
    if data.renal_function.egfr.is_some_and(|v| v < 15) {
        flags.push(AdditionalFlag {
            id: "FLAG-RENAL-001".to_string(),
            category: "Renal".to_string(),
            message: "eGFR below 15 - stage 5 CKD, nephrology co-management required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Hydronephrosis ──────────────────────────────────────
    if data.renal_function.hydronephrosis == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-RENAL-002".to_string(),
            category: "Renal".to_string(),
            message: "Hydronephrosis detected - identify and treat obstructive cause".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Large stone ─────────────────────────────────────────
    if data.stone_disease.stone_size_mm.is_some_and(|v| v > 10) {
        flags.push(AdditionalFlag {
            id: "FLAG-STONE-001".to_string(),
            category: "Stone".to_string(),
            message: "Stone exceeds 10mm - unlikely to pass spontaneously, intervention planning needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Severe stone pain ───────────────────────────────────
    if data.stone_disease.current_pain_level.is_some_and(|v| v >= 8) {
        flags.push(AdditionalFlag {
            id: "FLAG-STONE-002".to_string(),
            category: "Stone".to_string(),
            message: "Severe renal colic - adequate analgesia and urgent imaging required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Recurrent UTI ───────────────────────────────────────
    if data.lower_urinary_tract.recurrent_uti == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-UTI-001".to_string(),
            category: "Infection".to_string(),
            message: "Recurrent UTIs reported - investigate underlying cause and consider prophylaxis".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Cancer with weight loss ─────────────────────────────
    if data.urological_cancers.unexplained_weight_loss == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-CANCER-001".to_string(),
            category: "Cancer".to_string(),
            message: "Unexplained weight loss - investigate for malignancy progression".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Anticoagulant use with planned procedure ────────────
    if data.clinical_review.anticoagulant_use == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-001".to_string(),
            category: "Medication".to_string(),
            message: "Patient on anticoagulants - bridging protocol required for any procedure".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Family history prostate cancer ──────────────────────
    if data.prostate_assessment.family_history_prostate_cancer == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-FAMILY-001".to_string(),
            category: "Family History".to_string(),
            message: "Family history of prostate cancer - consider enhanced screening protocol".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── Dialysis patient ────────────────────────────────────
    if data.renal_function.dialysis == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-RENAL-003".to_string(),
            category: "Renal".to_string(),
            message: "Patient on dialysis - coordinate care with nephrology team".to_string(),
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
