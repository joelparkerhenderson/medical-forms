use super::types::{AdditionalFlag, AssessmentData};
use super::utils::any_motor_power_at_or_below;

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the severity score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // FLAG-STROKE-001: Acute focal deficit (stroke pathway)
    if data.neurological_history.stroke_history == "yes"
        || (data.neurological_history.symptom_onset == "sudden"
            && data.cranial_nerve_examination.facial_symmetry == "asymmetric")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-STROKE-001".to_string(),
            category: "Stroke".to_string(),
            message: "Acute focal deficit suspected - activate stroke pathway".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-SAH-001: Thunderclap headache (emergency CT)
    if data.headache_assessment.thunderclap_onset == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SAH-001".to_string(),
            category: "Headache".to_string(),
            message: "Thunderclap headache - emergency CT scan required to exclude SAH".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-CONS-001: Reduced consciousness
    if matches!(
        data.cognitive_screening.consciousness_level.as_str(),
        "drowsy" | "stuporous" | "comatose"
    ) {
        flags.push(AdditionalFlag {
            id: "FLAG-CONS-001".to_string(),
            category: "Consciousness".to_string(),
            message: "Reduced consciousness level - immediate medical review required".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-SEIZURE-001: New seizure (first seizure pathway)
    if data.neurological_history.seizure_history == "yes"
        && data.neurological_history.previous_neurological_condition.is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-SEIZURE-001".to_string(),
            category: "Seizure".to_string(),
            message: "New seizure without prior diagnosis - first seizure pathway".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-TUMOUR-001: Red flag headache (brain tumour)
    if data.headache_assessment.red_flag_symptoms == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-TUMOUR-001".to_string(),
            category: "Headache".to_string(),
            message: "Red flag headache symptoms - investigate for brain tumour".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-CORD-001: Suspected cord compression
    if !data.sensory_assessment.sensory_level.is_empty()
        && data.sensory_assessment.sensory_level != "none"
        && any_motor_power_at_or_below(data, 3)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CORD-001".to_string(),
            category: "Spinal".to_string(),
            message: "Sensory level with motor weakness - suspected cord compression".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-MOTOR-001: Significant motor weakness (<=2/5)
    if any_motor_power_at_or_below(data, 2) {
        flags.push(AdditionalFlag {
            id: "FLAG-MOTOR-001".to_string(),
            category: "Motor".to_string(),
            message: "Significant motor weakness (2/5 or below) - urgent assessment".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-COGN-001: Significant cognitive decline
    if data.cognitive_screening.mmse_score.is_some_and(|s| s < 20) {
        flags.push(AdditionalFlag {
            id: "FLAG-COGN-001".to_string(),
            category: "Cognitive".to_string(),
            message: "Significant cognitive decline (MMSE <20) - dementia assessment pathway".to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-GAIT-001: Unsafe gait (falls risk)
    if data.motor_assessment.gait_assessment == "abnormal" {
        flags.push(AdditionalFlag {
            id: "FLAG-GAIT-001".to_string(),
            category: "Gait".to_string(),
            message: "Abnormal gait - falls risk assessment required".to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-PROG-001: Rapidly progressive symptoms
    if data.neurological_history.symptom_onset == "sudden"
        && (data.neurological_history.symptom_duration == "hours"
            || data.neurological_history.symptom_duration == "minutes")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-PROG-001".to_string(),
            category: "Progression".to_string(),
            message: "Rapidly progressive symptoms - urgent investigation required".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-CN-001: Multiple cranial nerve palsies
    if super::utils::abnormal_cranial_nerve_count(data) >= 2 {
        flags.push(AdditionalFlag {
            id: "FLAG-CN-001".to_string(),
            category: "Cranial Nerve".to_string(),
            message: "Multiple cranial nerve palsies - brainstem or skull base pathology".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-SENS-001: Sensory level (spinal pathology)
    if !data.sensory_assessment.sensory_level.is_empty()
        && data.sensory_assessment.sensory_level != "none"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-SENS-001".to_string(),
            category: "Sensory".to_string(),
            message: "Sensory level detected - spinal pathology investigation needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-INV-001: Urgent investigation needed
    if data.clinical_review.urgency == "emergency" || data.clinical_review.urgency == "urgent" {
        flags.push(AdditionalFlag {
            id: "FLAG-INV-001".to_string(),
            category: "Investigation".to_string(),
            message: "Urgent investigation required based on clinical review".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-FUNC-001: Functional neurological disorder
    if data.clinical_review.primary_diagnosis.to_lowercase().contains("functional")
        || data.clinical_review.differential_diagnosis.to_lowercase().contains("functional")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-FUNC-001".to_string(),
            category: "Functional".to_string(),
            message: "Functional neurological disorder suspected - specialist referral".to_string(),
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
