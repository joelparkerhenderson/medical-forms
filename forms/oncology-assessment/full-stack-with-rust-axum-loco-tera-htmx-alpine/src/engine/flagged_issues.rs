use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the oncology score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Hematologic toxicity present ────────────────────────
    if matches!(
        data.side_effects_toxicity.hematologic_toxicity.as_str(),
        "grade3" | "grade4"
    ) {
        flags.push(AdditionalFlag {
            id: "FLAG-TOX-001".to_string(),
            category: "Toxicity".to_string(),
            message: "Grade 3-4 hematologic toxicity - urgent hematology review needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Significant weight loss ─────────────────────────────
    if data.side_effects_toxicity.weight_change == "significantLoss" {
        flags.push(AdditionalFlag {
            id: "FLAG-TOX-002".to_string(),
            category: "Nutrition".to_string(),
            message: "Significant weight loss reported - nutrition consult recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Severe neuropathy ───────────────────────────────────
    if matches!(data.side_effects_toxicity.neuropathy_severity, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-TOX-003".to_string(),
            category: "Toxicity".to_string(),
            message: "Severe neuropathy - consider treatment modification".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── High distress thermometer ───────────────────────────
    if matches!(data.psychosocial_assessment.distress_thermometer, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-PSY-001".to_string(),
            category: "Psychosocial".to_string(),
            message: "Distress thermometer elevated - psychosocial support referral needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Caregiver burden identified ─────────────────────────
    if data.psychosocial_assessment.caregiver_burden == "high" {
        flags.push(AdditionalFlag {
            id: "FLAG-PSY-002".to_string(),
            category: "Psychosocial".to_string(),
            message: "High caregiver burden reported - caregiver support referral".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Low social support ──────────────────────────────────
    if data.psychosocial_assessment.social_support == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-PSY-003".to_string(),
            category: "Psychosocial".to_string(),
            message: "Minimal social support - social work referral recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── No advance directive ────────────────────────────────
    if data.palliative_care_needs.advance_directive_status == "none" {
        flags.push(AdditionalFlag {
            id: "FLAG-PAL-001".to_string(),
            category: "Palliative".to_string(),
            message: "No advance directive on file - discussion recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Goals of care not discussed ─────────────────────────
    if data.palliative_care_needs.goals_of_care_discussed == "no" {
        flags.push(AdditionalFlag {
            id: "FLAG-PAL-002".to_string(),
            category: "Palliative".to_string(),
            message: "Goals of care have not been discussed with patient".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Poor pain management ────────────────────────────────
    if matches!(data.palliative_care_needs.pain_management_adequacy, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-PAL-003".to_string(),
            category: "Pain".to_string(),
            message: "Pain management inadequate - pain specialist referral recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Not reviewed by tumor board ─────────────────────────
    if data.clinical_review.tumor_board_reviewed == "no" {
        flags.push(AdditionalFlag {
            id: "FLAG-CLN-001".to_string(),
            category: "Clinical".to_string(),
            message: "Case not reviewed by tumor board - consider submission".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Treatment modification needed ───────────────────────
    if matches!(
        data.current_treatment.treatment_modifications.as_str(),
        "doseReduction" | "doseDelay" | "regimenChange"
    ) {
        flags.push(AdditionalFlag {
            id: "FLAG-TRT-001".to_string(),
            category: "Treatment".to_string(),
            message: "Treatment modification documented - review treatment plan".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Clinical trial enrollment ───────────────────────────
    if data.current_treatment.clinical_trial_enrollment == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-TRT-002".to_string(),
            category: "Treatment".to_string(),
            message: "Patient enrolled in clinical trial - ensure protocol compliance".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── Genetic testing not done ────────────────────────────
    if data.cancer_diagnosis.genetic_testing_done == "no" {
        flags.push(AdditionalFlag {
            id: "FLAG-DX-001".to_string(),
            category: "Diagnosis".to_string(),
            message: "Genetic testing not performed - consider referral for testing".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── Family cancer history present ───────────────────────
    if data.cancer_diagnosis.family_cancer_history == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-DX-002".to_string(),
            category: "Diagnosis".to_string(),
            message: "Family cancer history reported - genetic counselling may be appropriate".to_string(),
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
