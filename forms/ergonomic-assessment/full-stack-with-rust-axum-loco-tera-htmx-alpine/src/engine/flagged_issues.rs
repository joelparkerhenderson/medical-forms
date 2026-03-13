use super::types::{AdditionalFlag, AssessmentData};
use super::utils::count_pain_sites;

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the risk score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Urgent workplace adjustment needed ──────────────────
    if data.clinical_review.recommended_adjustments != ""
        && data.clinical_review.recommended_adjustments != "none"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-ADJUST-001".to_string(),
            category: "Workplace Adjustment".to_string(),
            message: "Workplace adjustments have been recommended - implement promptly".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Occupational health referral ────────────────────────
    if data.clinical_review.occupational_health_referral == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-OHREF-001".to_string(),
            category: "Occupational Health".to_string(),
            message: "Occupational health referral recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Manual handling training needed ─────────────────────
    if data.manual_handling.lifting_required == "yes"
        && data.manual_handling.manual_handling_training == "no"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MH-001".to_string(),
            category: "Manual Handling".to_string(),
            message: "Manual handling training required - lifting duties without training".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── DSE non-compliance ──────────────────────────────────
    if data.dse_assessment.dse_training_completed == "no" {
        flags.push(AdditionalFlag {
            id: "FLAG-DSE-001".to_string(),
            category: "DSE".to_string(),
            message: "DSE training not completed - non-compliance with regulations".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Repetitive strain indicator ─────────────────────────
    if matches!(data.musculoskeletal_symptoms.wrist_hand_pain, Some(4..=5))
        && data.musculoskeletal_symptoms.symptom_frequency == "daily"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-RSI-001".to_string(),
            category: "Repetitive Strain".to_string(),
            message: "Possible repetitive strain injury - significant daily wrist/hand pain".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Upper limb disorder ─────────────────────────────────
    if matches!(data.musculoskeletal_symptoms.shoulder_pain, Some(4..=5))
        || matches!(data.musculoskeletal_symptoms.elbow_pain, Some(4..=5))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-ULD-001".to_string(),
            category: "Upper Limb Disorder".to_string(),
            message: "Significant upper limb symptoms - further investigation recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Back pain ───────────────────────────────────────────
    if matches!(data.musculoskeletal_symptoms.lower_back_pain, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-BACK-001".to_string(),
            category: "Back Pain".to_string(),
            message: "Significant lower back pain reported - ergonomic review required".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Neck pain ───────────────────────────────────────────
    if matches!(data.musculoskeletal_symptoms.neck_pain, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-NECK-001".to_string(),
            category: "Neck Pain".to_string(),
            message: "Significant neck pain - review workstation and monitor setup".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── No mechanical aids for manual handling ──────────────
    if data.manual_handling.lifting_required == "yes"
        && data.manual_handling.mechanical_aids_available == "no"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MH-002".to_string(),
            category: "Manual Handling".to_string(),
            message: "No mechanical aids available for lifting tasks".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Eye test not offered for DSE users ──────────────────
    if data.dse_assessment.eye_test_offered == "no"
        && data.dse_assessment.continuous_dse_hours != ""
    {
        flags.push(AdditionalFlag {
            id: "FLAG-DSE-002".to_string(),
            category: "DSE".to_string(),
            message: "Eye test not offered to DSE user - employer obligation".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Insufficient breaks ─────────────────────────────────
    if data.break_patterns.break_frequency == "rarely"
        || data.break_patterns.break_frequency == "never"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-BREAK-001".to_string(),
            category: "Break Patterns".to_string(),
            message: "Insufficient break frequency reported - risk of fatigue and MSD".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Multiple pain sites ─────────────────────────────────
    if count_pain_sites(data) >= 3 {
        flags.push(AdditionalFlag {
            id: "FLAG-MSD-001".to_string(),
            category: "MSD Symptoms".to_string(),
            message: "Multiple body regions affected - comprehensive ergonomic review needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Previous MSD history ────────────────────────────────
    if data.clinical_review.previous_msd_history == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-HIST-001".to_string(),
            category: "Medical History".to_string(),
            message: "Previous MSD history - monitor for recurrence".to_string(),
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
