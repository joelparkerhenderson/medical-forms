use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the severity score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Hemoptysis present ──────────────────────────────────
    if data.symptom_assessment.hemoptysis_present == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SYMP-001".to_string(),
            category: "Symptoms".to_string(),
            message: "Hemoptysis reported - urgent evaluation required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Severe dyspnea ──────────────────────────────────────
    if data.symptom_assessment.dyspnea_severity == Some(5) {
        flags.push(AdditionalFlag {
            id: "FLAG-SYMP-002".to_string(),
            category: "Symptoms".to_string(),
            message: "Maximum dyspnea severity - assess for respiratory failure".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Active smoker with COPD ─────────────────────────────
    if data.smoking_exposure.smoking_status == "current"
        && data.respiratory_history.copd_history == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-SMOK-001".to_string(),
            category: "Smoking".to_string(),
            message: "Active smoker with COPD - smoking cessation intervention required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Asbestos exposure ───────────────────────────────────
    if data.smoking_exposure.asbestos_exposure == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SMOK-002".to_string(),
            category: "Exposure".to_string(),
            message: "Asbestos exposure history - mesothelioma screening recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Pulmonary nodule detected ───────────────────────────
    if data.chest_imaging.nodule_detected == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-IMG-001".to_string(),
            category: "Imaging".to_string(),
            message: "Pulmonary nodule detected - follow-up imaging or biopsy required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Pleural effusion ────────────────────────────────────
    if data.chest_imaging.pleural_effusion == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-IMG-002".to_string(),
            category: "Imaging".to_string(),
            message: "Pleural effusion detected - consider thoracentesis".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Supplemental oxygen needed ──────────────────────────
    if data.arterial_blood_gases.supplemental_oxygen == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-ABG-001".to_string(),
            category: "Blood Gases".to_string(),
            message: "Patient on supplemental oxygen - monitor oxygenation closely".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Witnessed apnea ─────────────────────────────────────
    if data.sleep_breathing.apnea_witnessed == "yes"
        && data.sleep_breathing.sleep_study_done == "no"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-SLP-001".to_string(),
            category: "Sleep".to_string(),
            message: "Witnessed apnea without sleep study - polysomnography recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Severe daytime sleepiness ───────────────────────────
    if matches!(data.sleep_breathing.daytime_sleepiness, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-SLP-002".to_string(),
            category: "Sleep".to_string(),
            message: "Significant daytime sleepiness - evaluate for sleep-disordered breathing".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Poor inhaler technique ──────────────────────────────
    if matches!(data.current_treatment.inhaler_technique, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-TRT-001".to_string(),
            category: "Treatment".to_string(),
            message: "Poor inhaler technique - patient education needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Treatment side effects ──────────────────────────────
    if data.current_treatment.side_effects_reported == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-TRT-002".to_string(),
            category: "Treatment".to_string(),
            message: "Side effects reported - review current medication regimen".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Frequent exacerbations ──────────────────────────────
    if data.clinical_review.exacerbation_frequency == "threeOrMore" {
        flags.push(AdditionalFlag {
            id: "FLAG-CLIN-001".to_string(),
            category: "Clinical".to_string(),
            message: "Frequent exacerbations (3+/year) - escalate maintenance therapy".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Specialist referral needed ──────────────────────────
    if data.clinical_review.specialist_referral_needed == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-CLIN-002".to_string(),
            category: "Clinical".to_string(),
            message: "Specialist referral recommended by reviewing clinician".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Lung cancer history with active smoking ─────────────
    if data.respiratory_history.lung_cancer_history == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-HIST-001".to_string(),
            category: "History".to_string(),
            message: "Lung cancer history - ensure surveillance imaging is up to date".to_string(),
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
