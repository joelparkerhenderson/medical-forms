use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the severity score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // FLAG-ACS-001: Acute chest pain (emergency pathway)
    if data.symptoms_assessment.chest_pain == "yes"
        && data.symptoms_assessment.chest_pain_type == "typical"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-ACS-001".to_string(),
            category: "ACS".to_string(),
            message: "Acute typical chest pain - consider emergency ACS pathway".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-HF-001: Severe heart failure (LVEF <30%)
    if matches!(data.echocardiography.lvef, Some(0..=29)) {
        flags.push(AdditionalFlag {
            id: "FLAG-HF-001".to_string(),
            category: "Heart Failure".to_string(),
            message: "Severe heart failure (LVEF <30%) - urgent cardiology review required"
                .to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-HF-002: Decompensated heart failure
    if data.symptoms_assessment.orthopnoea == "yes"
        && data.symptoms_assessment.pnd == "yes"
        && data.physical_examination.lung_creps == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-HF-002".to_string(),
            category: "Heart Failure".to_string(),
            message: "Signs of decompensated heart failure - consider admission".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-AF-001: New/uncontrolled AF
    if data.cardiac_history.atrial_fibrillation == "yes"
        && data.physical_examination.heart_rhythm == "irregular"
        && matches!(data.physical_examination.heart_rate, Some(100..=255))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-AF-001".to_string(),
            category: "Arrhythmia".to_string(),
            message: "Uncontrolled atrial fibrillation with rapid ventricular rate".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-SYNC-001: Syncope (risk of SCD)
    if data.symptoms_assessment.syncope == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SYNC-001".to_string(),
            category: "Syncope".to_string(),
            message: "Syncope reported - evaluate for risk of sudden cardiac death".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-ECG-001: Critical ECG abnormality
    if data.ecg_findings.st_changes == "yes"
        && data.symptoms_assessment.chest_pain == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-ECG-001".to_string(),
            category: "ECG".to_string(),
            message: "ST changes with chest pain - possible acute coronary event".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-VALVE-001: Severe valvular disease
    if data.echocardiography.valvular_abnormality == "yes"
        && (data.echocardiography.aortic_valve == "severeStenosis"
            || data.echocardiography.aortic_valve == "severeRegurgitation"
            || data.echocardiography.mitral_valve == "severeStenosis"
            || data.echocardiography.mitral_valve == "severeRegurgitation")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-VALVE-001".to_string(),
            category: "Valvular".to_string(),
            message: "Severe valvular disease - consider surgical or interventional referral"
                .to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-BP-001: Hypertensive crisis (>=180/120)
    if data
        .physical_examination
        .blood_pressure_systolic
        .is_some_and(|s| s >= 180.0)
        || data
            .physical_examination
            .blood_pressure_diastolic
            .is_some_and(|d| d >= 120.0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-BP-001".to_string(),
            category: "Hypertension".to_string(),
            message: "Hypertensive crisis (>=180/120) - immediate management required".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-TROP-001: Elevated troponin
    if data.investigations.troponin.is_some_and(|t| t > 14.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-TROP-001".to_string(),
            category: "Biomarker".to_string(),
            message: "Elevated troponin - myocardial injury, serial monitoring required"
                .to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-BNP-001: Significantly elevated BNP
    if data.investigations.bnp.is_some_and(|b| b > 400.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-BNP-001".to_string(),
            category: "Biomarker".to_string(),
            message: "Significantly elevated BNP (>400) - heart failure likely".to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-PACE-001: Pacemaker/ICD candidate
    if matches!(data.echocardiography.lvef, Some(0..=35))
        && data.cardiac_history.pacemaker != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-PACE-001".to_string(),
            category: "Device".to_string(),
            message: "LVEF <=35% without device therapy - consider ICD/CRT assessment".to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-ANGIO-001: Needs coronary angiography
    if data.symptoms_assessment.chest_pain == "yes"
        && data.investigations.coronary_angiogram_done != "yes"
        && data.investigations.stress_test_done != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-ANGIO-001".to_string(),
            category: "Investigation".to_string(),
            message: "Chest pain without coronary assessment - consider angiography or stress test"
                .to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-ANTI-001: AF without anticoagulation
    if data.cardiac_history.atrial_fibrillation == "yes"
        && (data.current_treatment.anticoagulant.is_empty()
            || data.current_treatment.anticoagulant == "none")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-ANTI-001".to_string(),
            category: "Anticoagulation".to_string(),
            message: "Atrial fibrillation without anticoagulation - stroke risk assessment needed"
                .to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-MED-001: Not on guideline-directed medical therapy
    if data.cardiac_history.heart_failure == "yes"
        && matches!(data.echocardiography.lvef, Some(0..=40))
    {
        let on_acei_or_arb = data.current_treatment.ace_inhibitor == "yes"
            || (!data.current_treatment.arb.is_empty() && data.current_treatment.arb != "none");
        let on_beta_blocker = data.current_treatment.beta_blocker == "yes";

        if !on_acei_or_arb || !on_beta_blocker {
            flags.push(AdditionalFlag {
                id: "FLAG-MED-001".to_string(),
                category: "Treatment".to_string(),
                message:
                    "HFrEF without guideline-directed medical therapy - review ACEi/ARB and beta-blocker"
                        .to_string(),
                priority: "medium".to_string(),
            });
        }
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
