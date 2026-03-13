use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the mobility score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── FLAG-BAL-001: Unable to stand unsupported ──────────
    if data.balance_assessment.static_standing_balance == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-BAL-001".to_string(),
            category: "Balance".to_string(),
            message: "Unable to maintain static standing balance - fall prevention measures required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-BAL-002: Poor dynamic balance ─────────────────
    if matches!(data.balance_assessment.dynamic_standing_balance, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-BAL-002".to_string(),
            category: "Balance".to_string(),
            message: "Dynamic standing balance impaired - risk during functional activities".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-GAIT-001: Unable to ambulate ──────────────────
    if data.gait_analysis.gait_pattern_quality == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-GAIT-001".to_string(),
            category: "Gait".to_string(),
            message: "Severely impaired gait pattern - assistive device review needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-GAIT-002: Cannot walk outdoors ────────────────
    if data.gait_analysis.outdoor_walking == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-GAIT-002".to_string(),
            category: "Gait".to_string(),
            message: "Unable to walk outdoors - community mobility severely limited".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-TRANS-001: Cannot perform sit-to-stand ────────
    if data.transfers_bed_mobility.sit_to_stand == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-TRANS-001".to_string(),
            category: "Transfers".to_string(),
            message: "Unable to perform sit-to-stand independently - hoist assessment may be needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-TRANS-002: Toilet transfer difficulty ──────────
    if matches!(data.transfers_bed_mobility.toilet_transfer, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-TRANS-002".to_string(),
            category: "Transfers".to_string(),
            message: "Toilet transfer difficulty - equipment and care needs review required".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-STAIR-001: Cannot manage stairs ───────────────
    if data.stairs_obstacles.stair_ascent == Some(1) && data.stairs_obstacles.stair_descent == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-STAIR-001".to_string(),
            category: "Stairs".to_string(),
            message: "Unable to manage stairs - home environment assessment needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-FALLS-001: Recurrent faller ───────────────────
    if data.falls_risk_assessment.falls_in_past_year == "twoOrMore" {
        flags.push(AdditionalFlag {
            id: "FLAG-FALLS-001".to_string(),
            category: "Falls".to_string(),
            message: "Recurrent faller - comprehensive falls prevention programme required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-FALLS-002: Fear of falling limiting activity ──
    if matches!(data.falls_risk_assessment.fear_of_falling, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-FALLS-002".to_string(),
            category: "Falls".to_string(),
            message: "Significant fear of falling - may lead to activity avoidance and deconditioning".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-PAIN-001: Severe pain limiting mobility ───────
    if data.mobility_history.pain_with_movement == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-PAIN-001".to_string(),
            category: "Pain".to_string(),
            message: "Severe pain with movement - pain management review before mobility programme".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-DEVICE-001: No assistive device but impaired ──
    if data.assistive_devices.current_device_type == "none"
        && matches!(data.gait_analysis.gait_pattern_quality, Some(1..=2))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-DEVICE-001".to_string(),
            category: "Assistive Devices".to_string(),
            message: "Impaired gait without assistive device - device prescription recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-DEVICE-002: Device in poor condition ──────────
    if data.assistive_devices.device_condition == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-DEVICE-002".to_string(),
            category: "Assistive Devices".to_string(),
            message: "Assistive device in poor condition - replacement or repair needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-VISION-001: Vision impairment affecting mobility
    if matches!(data.falls_risk_assessment.vision_impairment, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-VISION-001".to_string(),
            category: "Vision".to_string(),
            message: "Vision impairment affecting mobility - ophthalmology referral recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-COG-001: Cognitive impact on mobility ─────────
    if data.falls_risk_assessment.cognitive_impact_on_mobility == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-COG-001".to_string(),
            category: "Cognition".to_string(),
            message: "Significant cognitive impact on mobility - supervision requirements review".to_string(),
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
