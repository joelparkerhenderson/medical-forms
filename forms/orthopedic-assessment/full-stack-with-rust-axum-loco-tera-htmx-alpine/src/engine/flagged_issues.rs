use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the severity score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── FLAG-PAIN-001: Severe rest pain ─────────────────────
    if matches!(data.pain_assessment.pain_at_rest, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-PAIN-001".to_string(),
            category: "Pain".to_string(),
            message: "Significant pain at rest - consider urgent pain management review".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-PAIN-002: Radiating pain ───────────────────────
    if data.pain_assessment.pain_radiating == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-PAIN-002".to_string(),
            category: "Pain".to_string(),
            message: "Radiating pain reported - assess for nerve involvement".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-JOINT-001: Joint instability ───────────────────
    if matches!(data.joint_examination.joint_stability, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-JOINT-001".to_string(),
            category: "Joint".to_string(),
            message: "Joint instability detected - consider bracing or surgical stabilisation".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-JOINT-002: Crepitus present ────────────────────
    if data.joint_examination.joint_crepitus == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-JOINT-002".to_string(),
            category: "Joint".to_string(),
            message: "Joint crepitus noted - assess for degenerative changes".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── FLAG-MUSCLE-001: Significant atrophy ────────────────
    if matches!(data.muscle_assessment.muscle_atrophy, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-MUSCLE-001".to_string(),
            category: "Muscle".to_string(),
            message: "Significant muscle atrophy - initiate rehabilitation programme".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-MUSCLE-002: Absent reflexes ────────────────────
    if data.muscle_assessment.reflexes_normal == "no" {
        flags.push(AdditionalFlag {
            id: "FLAG-MUSCLE-002".to_string(),
            category: "Muscle".to_string(),
            message: "Abnormal reflexes - neurological assessment recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-SPINE-001: Disc involvement ────────────────────
    if data.spinal_assessment.disc_involvement == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SPINE-001".to_string(),
            category: "Spine".to_string(),
            message: "Disc involvement confirmed - consider MRI and specialist referral".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-SPINE-002: Positive straight leg raise ─────────
    if matches!(data.spinal_assessment.straight_leg_raise, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-SPINE-002".to_string(),
            category: "Spine".to_string(),
            message: "Positive straight leg raise - lumbar disc herniation likely".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-FUNC-001: Unable to work ───────────────────────
    if matches!(data.functional_status.work_capacity, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-FUNC-001".to_string(),
            category: "Functional".to_string(),
            message: "Severely reduced work capacity - occupational assessment needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-FUNC-002: Fall risk ────────────────────────────
    if matches!(data.functional_status.fall_risk, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-FUNC-002".to_string(),
            category: "Functional".to_string(),
            message: "High fall risk identified - implement fall prevention measures".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-SURG-001: High anaesthetic risk ────────────────
    if matches!(data.surgical_considerations.anaesthetic_risk, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-SURG-001".to_string(),
            category: "Surgical".to_string(),
            message: "High anaesthetic risk - pre-operative optimisation required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-SURG-002: Urgent surgery indicated ─────────────
    if matches!(data.surgical_considerations.surgical_urgency, Some(4..=5))
        && data.surgical_considerations.surgical_candidate == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-SURG-002".to_string(),
            category: "Surgical".to_string(),
            message: "Urgent surgical intervention indicated - expedite theatre booking".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-IMAGE-001: Further imaging needed ──────────────
    if data.imaging_investigations.further_imaging_needed == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-IMAGE-001".to_string(),
            category: "Imaging".to_string(),
            message: "Further imaging required - arrange appropriate investigation".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-CLIN-001: Red flag symptoms ────────────────────
    if data.clinical_review.red_flag_symptoms == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-CLIN-001".to_string(),
            category: "Clinical".to_string(),
            message: "Red flag symptoms present - urgent clinical review and investigation".to_string(),
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
