use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the severity score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── FLAG-PMB-001: Postmenopausal bleeding ──────────────
    if data.menopause_assessment.menopausal_status == "postmenopausal"
        && data.menstrual_history.intermenstrual_bleeding == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-PMB-001".to_string(),
            category: "Bleeding".to_string(),
            message: "Postmenopausal bleeding - urgent 2-week-wait referral required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-CERV-001: Abnormal cervical screening ─────────
    if data.cervical_screening.smear_result == "abnormal"
        || data.cervical_screening.smear_result == "highGrade"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CERV-001".to_string(),
            category: "Cervical".to_string(),
            message: "Abnormal cervical screening - colposcopy referral recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-MALIG-001: Suspected malignancy ───────────────
    if data.breast_health.breast_symptoms == "lump"
        && data.breast_health.family_breast_cancer == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MALIG-001".to_string(),
            category: "Malignancy".to_string(),
            message: "Breast lump with family history - urgent triple assessment required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-PAIN-001: Severe pelvic pain ──────────────────
    if data.gynecological_symptoms.pelvic_pain_severity == Some(5) {
        flags.push(AdditionalFlag {
            id: "FLAG-PAIN-001".to_string(),
            category: "Pain".to_string(),
            message: "Severe pelvic pain (5/5) - urgent clinical assessment required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-ENDO-001: Suspected endometriosis ─────────────
    if matches!(data.gynecological_symptoms.dysmenorrhoea, Some(4..=5))
        && data.gynecological_symptoms.dyspareunia == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-ENDO-001".to_string(),
            category: "Endometriosis".to_string(),
            message: "Severe dysmenorrhoea with dyspareunia - consider endometriosis investigation".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-FERT-001: Fertility concerns ──────────────────
    if data.contraception_fertility.fertility_concerns == "yes"
        && data.contraception_fertility.future_fertility_wishes == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-FERT-001".to_string(),
            category: "Fertility".to_string(),
            message: "Active fertility concerns with desire for pregnancy - fertility review needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-MENO-001: Severe menopausal symptoms ──────────
    if matches!(data.menopause_assessment.vasomotor_symptoms, Some(4..=5))
        || matches!(data.menopause_assessment.mood_changes, Some(4..=5))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MENO-001".to_string(),
            category: "Menopause".to_string(),
            message: "Severe menopausal symptoms - review HRT options and management plan".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-BREAST-001: Breast symptoms ───────────────────
    if !data.breast_health.breast_symptoms.is_empty()
        && data.breast_health.breast_symptoms != "none"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-BREAST-001".to_string(),
            category: "Breast".to_string(),
            message: "Breast symptoms reported - clinical breast examination recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-STI-001: STI screening concerns ───────────────
    if !data.sexual_health.current_concerns.is_empty()
        && data.sexual_health.current_concerns != "none"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-STI-001".to_string(),
            category: "Sexual Health".to_string(),
            message: "Current sexual health concerns - STI screening and review recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-DV-001: Domestic violence ─────────────────────
    if data.sexual_health.domestic_violence_screening == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-DV-001".to_string(),
            category: "Safeguarding".to_string(),
            message: "Domestic violence disclosed - safeguarding protocol required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-FGM-001: FGM assessment ───────────────────────
    if data.sexual_health.fgm_assessment == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-FGM-001".to_string(),
            category: "Safeguarding".to_string(),
            message: "FGM identified - mandatory reporting and specialist referral required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-CONT-001: Contraception dissatisfaction ───────
    if data.contraception_fertility.satisfaction == "dissatisfied"
        || data.contraception_fertility.satisfaction == "veryDissatisfied"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CONT-001".to_string(),
            category: "Contraception".to_string(),
            message: "Dissatisfied with current contraception - review alternative methods".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── FLAG-PROL-001: Prolapse symptoms ───────────────────
    if data.gynecological_symptoms.prolapse_symptoms == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-PROL-001".to_string(),
            category: "Prolapse".to_string(),
            message: "Prolapse symptoms reported - pelvic floor assessment recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-URG-001: Urinary symptoms ─────────────────────
    if data.gynecological_symptoms.urinary_symptoms == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-URG-001".to_string(),
            category: "Urogynecology".to_string(),
            message: "Urinary symptoms reported - urogynaecological assessment recommended".to_string(),
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
