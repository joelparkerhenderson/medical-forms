use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the impairment score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Severe pain at rest ─────────────────────────────────
    if matches!(data.pain_assessment.pain_at_rest, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-PAIN-001".to_string(),
            category: "Pain".to_string(),
            message: "Significant pain at rest - review pain management strategy".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Pain with all movement ──────────────────────────────
    if data.pain_assessment.pain_with_movement == Some(5) {
        flags.push(AdditionalFlag {
            id: "FLAG-PAIN-002".to_string(),
            category: "Pain".to_string(),
            message: "Extreme pain with movement - consider imaging or specialist referral".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Fall risk from balance ──────────────────────────────
    if data.gait_analysis.balance_during_gait == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-GAIT-001".to_string(),
            category: "Gait".to_string(),
            message: "Very poor balance during gait - high fall risk, assistive device review needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Asymmetric gait pattern ─────────────────────────────
    if matches!(data.gait_analysis.stride_symmetry, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-GAIT-002".to_string(),
            category: "Gait".to_string(),
            message: "Significant gait asymmetry detected - assess for underlying cause".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Bilateral strength asymmetry ────────────────────────
    if matches!(data.muscle_strength_testing.bilateral_symmetry, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-STR-001".to_string(),
            category: "Muscle Strength".to_string(),
            message: "Significant bilateral strength asymmetry - neurological screening recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Poor core stability ─────────────────────────────────
    if data.muscle_strength_testing.core_stability == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-STR-002".to_string(),
            category: "Muscle Strength".to_string(),
            message: "Very poor core stability - spinal injury risk, prioritise core rehabilitation".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Severe spinal curvature ─────────────────────────────
    if data.postural_assessment.spinal_curvature == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-POST-001".to_string(),
            category: "Posture".to_string(),
            message: "Severe spinal curvature abnormality - orthopedic referral recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Pelvic tilt concern ─────────────────────────────────
    if matches!(data.postural_assessment.pelvic_tilt, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-POST-002".to_string(),
            category: "Posture".to_string(),
            message: "Significant pelvic tilt - assess for leg length discrepancy".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Cervical mobility restriction ───────────────────────
    if data.range_of_motion.cervical_flexion == Some(1) && data.range_of_motion.cervical_rotation == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-ROM-001".to_string(),
            category: "Range of Motion".to_string(),
            message: "Severely restricted cervical mobility - urgent cervical spine assessment needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Poor single leg balance ─────────────────────────────
    if data.functional_testing.single_leg_balance == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-FUNC-001".to_string(),
            category: "Functional Testing".to_string(),
            message: "Unable to perform single leg balance - vestibular or proprioceptive assessment needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Poor exercise compliance ────────────────────────────
    if matches!(data.exercise_prescription.home_exercise_compliance, Some(1..=2))
        && matches!(data.exercise_prescription.motivation_level, Some(1..=2))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-EX-001".to_string(),
            category: "Exercise".to_string(),
            message: "Low exercise compliance and motivation - consider behavioural strategies".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Sleep quality concern ───────────────────────────────
    if matches!(data.movement_history.sleep_quality, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-HIST-001".to_string(),
            category: "Movement History".to_string(),
            message: "Poor sleep quality reported - may impair recovery".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Referral recommended ────────────────────────────────
    if data.clinical_review.referral_recommended == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-CLIN-001".to_string(),
            category: "Clinical Review".to_string(),
            message: "Clinician recommends specialist referral".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Poor prognosis ──────────────────────────────────────
    if data.clinical_review.prognosis_rating == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-CLIN-002".to_string(),
            category: "Clinical Review".to_string(),
            message: "Very poor prognosis rating - review treatment plan and consider alternative approaches".to_string(),
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
