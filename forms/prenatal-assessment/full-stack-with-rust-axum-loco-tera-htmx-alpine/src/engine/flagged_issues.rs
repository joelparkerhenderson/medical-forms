use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the risk score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Severe hypertension ─────────────────────────────────
    if matches!(data.physical_examination.blood_pressure_systolic, Some(s) if s >= 160)
        || matches!(data.physical_examination.blood_pressure_diastolic, Some(d) if d >= 110)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-BP-001".to_string(),
            category: "Blood Pressure".to_string(),
            message: "Severe hypertension detected - urgent obstetric review required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Proteinuria with hypertension (preeclampsia risk) ───
    if matches!(data.physical_examination.proteinuria.as_str(), "1plus" | "2plus" | "3plus")
        && (matches!(data.physical_examination.blood_pressure_systolic, Some(s) if s >= 140)
            || matches!(data.physical_examination.blood_pressure_diastolic, Some(d) if d >= 90))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-BP-002".to_string(),
            category: "Preeclampsia".to_string(),
            message: "Proteinuria with hypertension - assess for preeclampsia".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Previous stillbirth ─────────────────────────────────
    if data.obstetric_history.previous_stillbirth == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-OBS-001".to_string(),
            category: "Obstetric History".to_string(),
            message: "Previous stillbirth - enhanced surveillance plan required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Vaginal bleeding ────────────────────────────────────
    if data.current_pregnancy.vaginal_bleeding == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-PREG-001".to_string(),
            category: "Current Pregnancy".to_string(),
            message: "Vaginal bleeding reported - urgent assessment needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Reduced fetal movements ─────────────────────────────
    if data.current_pregnancy.fetal_movements == "reduced" {
        flags.push(AdditionalFlag {
            id: "FLAG-PREG-002".to_string(),
            category: "Current Pregnancy".to_string(),
            message: "Reduced fetal movements reported - further assessment required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Structural abnormalities on ultrasound ──────────────
    if data.ultrasound_findings.structural_abnormalities == "detected" {
        flags.push(AdditionalFlag {
            id: "FLAG-US-001".to_string(),
            category: "Ultrasound".to_string(),
            message: "Structural abnormalities detected - fetal medicine referral needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Severe anaemia ──────────────────────────────────────
    if matches!(data.blood_tests.haemoglobin, Some(h) if h < 90.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-BLOOD-001".to_string(),
            category: "Haematology".to_string(),
            message: "Severe anaemia (Hb < 90 g/L) - urgent treatment required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Abnormal fetal growth ───────────────────────────────
    if matches!(data.ultrasound_findings.fetal_growth_centile.as_str(), "belowTenth" | "aboveNinetieth") {
        flags.push(AdditionalFlag {
            id: "FLAG-US-002".to_string(),
            category: "Ultrasound".to_string(),
            message: "Abnormal fetal growth centile - growth surveillance required".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Domestic abuse screening positive ───────────────────
    if data.mental_health_wellbeing.domestic_abuse_screening == "positive" {
        flags.push(AdditionalFlag {
            id: "FLAG-MH-001".to_string(),
            category: "Safeguarding".to_string(),
            message: "Domestic abuse screening positive - safeguarding referral required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Substance use in pregnancy ──────────────────────────
    if data.mental_health_wellbeing.substance_use == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-MH-002".to_string(),
            category: "Substance Use".to_string(),
            message: "Substance use reported - specialist midwife referral recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Smoking in pregnancy ────────────────────────────────
    if data.mental_health_wellbeing.smoking_status == "current" {
        flags.push(AdditionalFlag {
            id: "FLAG-MH-003".to_string(),
            category: "Smoking".to_string(),
            message: "Current smoker - smoking cessation support required".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Low placenta ────────────────────────────────────────
    if data.ultrasound_findings.placental_position == "low" || data.ultrasound_findings.placental_position == "praevia" {
        flags.push(AdditionalFlag {
            id: "FLAG-US-003".to_string(),
            category: "Ultrasound".to_string(),
            message: "Low-lying placenta or placenta praevia - plan repeat scan".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Safeguarding concerns ───────────────────────────────
    if data.clinical_review.safeguarding_concerns == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SAFE-001".to_string(),
            category: "Safeguarding".to_string(),
            message: "Safeguarding concerns identified - follow local safeguarding protocol".to_string(),
            priority: "high".to_string(),
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
