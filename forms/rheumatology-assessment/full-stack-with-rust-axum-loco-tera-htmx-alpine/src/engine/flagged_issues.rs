use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the activity score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Severe joint erosion on imaging ─────────────────────
    if data.imaging_findings.xray_erosions_present == "yes"
        && data.imaging_findings.xray_joint_space_narrowing == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-IMG-001".to_string(),
            category: "Imaging".to_string(),
            message: "Joint erosions with space narrowing - structural damage progressing".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── MRI bone edema ──────────────────────────────────────
    if data.imaging_findings.mri_bone_edema_present == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-IMG-002".to_string(),
            category: "Imaging".to_string(),
            message: "MRI bone edema detected - predictor of future erosion".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Prolonged morning stiffness ─────────────────────────
    if data.morning_stiffness.stiffness_duration_minutes.is_some_and(|m| m >= 120) {
        flags.push(AdditionalFlag {
            id: "FLAG-STIFF-001".to_string(),
            category: "Morning Stiffness".to_string(),
            message: "Morning stiffness exceeds 2 hours - poorly controlled inflammation".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Severe pain ─────────────────────────────────────────
    if matches!(data.disease_activity.pain_vas_score, Some(9..=10)) {
        flags.push(AdditionalFlag {
            id: "FLAG-PAIN-001".to_string(),
            category: "Disease Activity".to_string(),
            message: "Severe pain reported (VAS 9-10) - urgent pain management review".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Anemia ──────────────────────────────────────────────
    if data.laboratory_markers.hemoglobin_value.is_some_and(|v| v < 10.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-LAB-001".to_string(),
            category: "Laboratory".to_string(),
            message: "Hemoglobin below 10 g/dL - evaluate for anemia of chronic disease".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Seropositive with active disease ────────────────────
    if data.laboratory_markers.rheumatoid_factor_positive == "yes"
        && data.laboratory_markers.anti_ccp_positive == "yes"
        && data.joint_assessment.swollen_joint_count.is_some_and(|c| c >= 4)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-LAB-002".to_string(),
            category: "Laboratory".to_string(),
            message: "Double seropositive with active synovitis - aggressive therapy warranted".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Cardiovascular comorbidity ──────────────────────────
    if data.comorbidities.cardiovascular_disease == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-COMOR-001".to_string(),
            category: "Comorbidity".to_string(),
            message: "Cardiovascular disease present - monitor NSAID and corticosteroid use".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Osteoporosis risk ───────────────────────────────────
    if data.comorbidities.osteoporosis == "yes"
        && data.medication_history.corticosteroid_use == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-COMOR-002".to_string(),
            category: "Comorbidity".to_string(),
            message: "Osteoporosis with ongoing corticosteroid use - bone protection review needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Work disability ─────────────────────────────────────
    if data.functional_status.work_disability == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-FUNC-001".to_string(),
            category: "Functional".to_string(),
            message: "Work disability reported - occupational therapy referral recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Mental health concerns ──────────────────────────────
    if data.comorbidities.mental_health_concerns == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-COMOR-003".to_string(),
            category: "Comorbidity".to_string(),
            message: "Mental health concerns reported - psychological support review".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Infection history with biologic use ─────────────────
    if data.comorbidities.infection_history == "yes"
        && !data.medication_history.biologic_therapy.is_empty()
        && data.medication_history.biologic_therapy != "none"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-001".to_string(),
            category: "Medication".to_string(),
            message: "Infection history with biologic therapy - monitor closely for reactivation".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── No DMARD therapy ────────────────────────────────────
    if (data.medication_history.current_dmard_therapy.is_empty()
        || data.medication_history.current_dmard_therapy == "none")
        && data.joint_assessment.swollen_joint_count.is_some_and(|c| c >= 1)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-002".to_string(),
            category: "Medication".to_string(),
            message: "Active synovitis without DMARD therapy - treatment initiation recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Patient education not provided ──────────────────────
    if data.clinical_review.patient_education_provided == "no" {
        flags.push(AdditionalFlag {
            id: "FLAG-REVIEW-001".to_string(),
            category: "Clinical Review".to_string(),
            message: "Patient education not provided - ensure disease self-management education".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── Assistive devices needed ────────────────────────────
    if data.functional_status.assistive_devices_needed == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-FUNC-002".to_string(),
            category: "Functional".to_string(),
            message: "Assistive devices needed - review functional support and OT referral".to_string(),
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
