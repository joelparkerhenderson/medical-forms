use super::types::AssessmentData;
use super::utils::{any_motor_power_at_or_below, abnormal_cranial_nerve_count, composite_cognitive_score};

/// A declarative neurology concern rule.
pub struct NeurologyRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All neurology rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<NeurologyRule> {
    vec![
        // ─── HIGH CONCERN (NEURO-001 to NEURO-005) ────────────────
        NeurologyRule {
            id: "NEURO-001",
            category: "Headache",
            description: "Thunderclap headache onset - subarachnoid haemorrhage risk",
            concern_level: "high",
            evaluate: |d| d.headache_assessment.thunderclap_onset == "yes",
        },
        NeurologyRule {
            id: "NEURO-002",
            category: "Motor",
            description: "New focal neurological deficit - acute stroke pathway",
            concern_level: "high",
            evaluate: |d| {
                // Focal deficit: asymmetric motor power or facial asymmetry
                let asymmetric_power = match (
                    d.motor_assessment.upper_limb_power_right,
                    d.motor_assessment.upper_limb_power_left,
                ) {
                    (Some(r), Some(l)) if (r as i8 - l as i8).unsigned_abs() >= 2 => true,
                    _ => false,
                } || match (
                    d.motor_assessment.lower_limb_power_right,
                    d.motor_assessment.lower_limb_power_left,
                ) {
                    (Some(r), Some(l)) if (r as i8 - l as i8).unsigned_abs() >= 2 => true,
                    _ => false,
                };
                asymmetric_power || d.cranial_nerve_examination.facial_symmetry == "asymmetric"
            },
        },
        NeurologyRule {
            id: "NEURO-003",
            category: "Consciousness",
            description: "Reduced consciousness level - immediate assessment required",
            concern_level: "high",
            evaluate: |d| {
                matches!(
                    d.cognitive_screening.consciousness_level.as_str(),
                    "stuporous" | "comatose"
                )
            },
        },
        NeurologyRule {
            id: "NEURO-004",
            category: "Reflexes",
            description: "Extensor plantar response - upper motor neuron lesion",
            concern_level: "high",
            evaluate: |d| d.reflexes_coordination.plantar_response == "extensor",
        },
        NeurologyRule {
            id: "NEURO-005",
            category: "History",
            description: "Rapidly progressive symptoms with sudden onset",
            concern_level: "high",
            evaluate: |d| {
                d.neurological_history.symptom_onset == "sudden"
                    && (d.neurological_history.symptom_duration == "hours"
                        || d.neurological_history.symptom_duration == "minutes")
            },
        },
        // ─── MEDIUM CONCERN (NEURO-006 to NEURO-015) ──────────────
        NeurologyRule {
            id: "NEURO-006",
            category: "Headache",
            description: "Migraine with aura - cerebrovascular risk assessment needed",
            concern_level: "medium",
            evaluate: |d| {
                d.headache_assessment.headache_type == "migraine"
                    && d.headache_assessment.aura_present == "yes"
            },
        },
        NeurologyRule {
            id: "NEURO-007",
            category: "Motor",
            description: "Motor power 3/5 or below - significant weakness",
            concern_level: "medium",
            evaluate: |d| any_motor_power_at_or_below(d, 3),
        },
        NeurologyRule {
            id: "NEURO-008",
            category: "Gait",
            description: "Abnormal gait assessment - falls risk",
            concern_level: "medium",
            evaluate: |d| d.motor_assessment.gait_assessment == "abnormal",
        },
        NeurologyRule {
            id: "NEURO-009",
            category: "Sensory",
            description: "Sensory level present - spinal pathology suspected",
            concern_level: "medium",
            evaluate: |d| !d.sensory_assessment.sensory_level.is_empty()
                && d.sensory_assessment.sensory_level != "none",
        },
        NeurologyRule {
            id: "NEURO-010",
            category: "Seizure",
            description: "Seizure history without established diagnosis",
            concern_level: "medium",
            evaluate: |d| {
                d.neurological_history.seizure_history == "yes"
                    && d.neurological_history.previous_neurological_condition.is_empty()
            },
        },
        NeurologyRule {
            id: "NEURO-011",
            category: "Cognitive",
            description: "Cognitive impairment - MMSE score below 24",
            concern_level: "medium",
            evaluate: |d| d.cognitive_screening.mmse_score.is_some_and(|s| s < 24),
        },
        NeurologyRule {
            id: "NEURO-012",
            category: "Cranial Nerve",
            description: "Abnormal cranial nerve examination findings",
            concern_level: "medium",
            evaluate: |d| abnormal_cranial_nerve_count(d) >= 1,
        },
        NeurologyRule {
            id: "NEURO-013",
            category: "Sensory",
            description: "Peripheral neuropathy detected",
            concern_level: "medium",
            evaluate: |d| d.sensory_assessment.peripheral_neuropathy == "yes",
        },
        NeurologyRule {
            id: "NEURO-014",
            category: "Reflexes",
            description: "Brisk reflexes with clonus present",
            concern_level: "medium",
            evaluate: |d| {
                d.reflexes_coordination.biceps_reflex == "clonusPresent"
                    || d.reflexes_coordination.knee_reflex == "clonusPresent"
                    || d.reflexes_coordination.ankle_reflex == "clonusPresent"
            },
        },
        NeurologyRule {
            id: "NEURO-015",
            category: "Headache",
            description: "Headache with red flag symptoms",
            concern_level: "medium",
            evaluate: |d| d.headache_assessment.red_flag_symptoms == "yes",
        },
        // ─── LOW CONCERN (NEURO-016 to NEURO-020) ─────────────────
        NeurologyRule {
            id: "NEURO-016",
            category: "Overall",
            description: "Normal neurological examination - no abnormalities found",
            concern_level: "low",
            evaluate: |d| {
                // All cranial nerves normal
                d.cranial_nerve_examination.visual_fields == "normal"
                    && d.cranial_nerve_examination.pupil_reaction == "normal"
                    && d.cranial_nerve_examination.eye_movements == "normal"
                    && d.cranial_nerve_examination.facial_symmetry == "normal"
                    // Motor normal (all 5/5)
                    && d.motor_assessment.upper_limb_power_right == Some(5)
                    && d.motor_assessment.upper_limb_power_left == Some(5)
                    && d.motor_assessment.lower_limb_power_right == Some(5)
                    && d.motor_assessment.lower_limb_power_left == Some(5)
                    && d.motor_assessment.gait_assessment == "normal"
                    // Reflexes normal
                    && d.reflexes_coordination.plantar_response == "flexor"
                    && d.reflexes_coordination.finger_nose_test == "normal"
                    && d.reflexes_coordination.romberg_sign == "negative"
            },
        },
        NeurologyRule {
            id: "NEURO-017",
            category: "Headache",
            description: "Tension headache only - benign pattern",
            concern_level: "low",
            evaluate: |d| {
                d.headache_assessment.headache_type == "tension"
                    && d.headache_assessment.red_flag_symptoms != "yes"
                    && d.headache_assessment.thunderclap_onset != "yes"
            },
        },
        NeurologyRule {
            id: "NEURO-018",
            category: "Sensory",
            description: "Mild sensory changes only - monitoring appropriate",
            concern_level: "low",
            evaluate: |d| {
                d.sensory_assessment.light_touch == "abnormal"
                    && d.sensory_assessment.peripheral_neuropathy != "yes"
                    && d.sensory_assessment.dermatomal_pattern != "yes"
            },
        },
        NeurologyRule {
            id: "NEURO-019",
            category: "Seizure",
            description: "Well-controlled epilepsy - routine follow-up",
            concern_level: "low",
            evaluate: |d| {
                d.neurological_history.seizure_history == "yes"
                    && !d.neurological_history.previous_neurological_condition.is_empty()
                    && d.cognitive_screening.consciousness_level == "alert"
            },
        },
        NeurologyRule {
            id: "NEURO-020",
            category: "Cognitive",
            description: "Normal cognitive screening scores",
            concern_level: "low",
            evaluate: |d| {
                composite_cognitive_score(d).is_some_and(|s| s >= 26)
                    || d.cognitive_screening.mmse_score.is_some_and(|s| s >= 27)
                    || d.cognitive_screening.moca_score.is_some_and(|s| s >= 26)
            },
        },
    ]
}
