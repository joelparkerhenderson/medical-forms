use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the composite score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Tinnitus reported ──────────────────────────────────
    if data.hearing_history.tinnitus_present == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-HIST-001".to_string(),
            category: "Hearing History".to_string(),
            message: "Tinnitus reported - consider tinnitus management features".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Severe hearing loss in either ear ──────────────────
    if data.audiometric_results.right_ear_pta.is_some_and(|v| v > 90)
        || data.audiometric_results.left_ear_pta.is_some_and(|v| v > 90)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-AUDIO-001".to_string(),
            category: "Audiometric".to_string(),
            message: "Profound hearing loss detected (PTA > 90 dB) - consider cochlear implant referral".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Asymmetric hearing loss ────────────────────────────
    if let (Some(right), Some(left)) = (
        data.audiometric_results.right_ear_pta,
        data.audiometric_results.left_ear_pta,
    ) {
        let diff = (right as i16 - left as i16).unsigned_abs();
        if diff > 20 {
            flags.push(AdditionalFlag {
                id: "FLAG-AUDIO-002".to_string(),
                category: "Audiometric".to_string(),
                message: "Significant asymmetry between ears - medical review recommended".to_string(),
                priority: "high".to_string(),
            });
        }
    }

    // ─── Poor speech recognition ────────────────────────────
    if data.audiometric_results.speech_recognition_right.is_some_and(|v| v < 40)
        || data.audiometric_results.speech_recognition_left.is_some_and(|v| v < 40)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-AUDIO-003".to_string(),
            category: "Audiometric".to_string(),
            message: "Very poor speech recognition - limited hearing aid benefit expected".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Low manual dexterity ───────────────────────────────
    if matches!(data.lifestyle_assessment.manual_dexterity, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-LIFE-001".to_string(),
            category: "Lifestyle".to_string(),
            message: "Low manual dexterity - consider easy-to-handle hearing aid styles".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── High cosmetic concern ──────────────────────────────
    if data.lifestyle_assessment.cosmetic_concern == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-LIFE-002".to_string(),
            category: "Lifestyle".to_string(),
            message: "High cosmetic concern - consider invisible-in-canal or receiver-in-canal styles".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── Previous hearing aid rejection ─────────────────────
    if data.hearing_history.previous_hearing_aid_use == "triedRejected" {
        flags.push(AdditionalFlag {
            id: "FLAG-HIST-002".to_string(),
            category: "Hearing History".to_string(),
            message: "Previous hearing aid rejection - assess reasons and manage expectations".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── No support system ──────────────────────────────────
    if data.expectations_goals.support_system == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-EXPECT-001".to_string(),
            category: "Expectations".to_string(),
            message: "No support system identified - may need additional counselling".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Unilateral fitting with bilateral loss ─────────────
    if data.fitting_requirements.bilateral_fitting == "unilateral"
        && data.audiometric_results.right_ear_pta.is_some_and(|v| v > 25)
        && data.audiometric_results.left_ear_pta.is_some_and(|v| v > 25)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-FIT-001".to_string(),
            category: "Fitting".to_string(),
            message: "Unilateral fitting selected despite bilateral hearing loss - discuss bilateral option".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Noise exposure ongoing ─────────────────────────────
    if data.hearing_history.noise_exposure == "ongoing" {
        flags.push(AdditionalFlag {
            id: "FLAG-HIST-003".to_string(),
            category: "Hearing History".to_string(),
            message: "Ongoing noise exposure - recommend hearing protection".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Low initial comfort during trial ───────────────────
    if data.trial_period.initial_comfort == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-TRIAL-001".to_string(),
            category: "Trial".to_string(),
            message: "Very poor initial comfort - physical fit adjustment needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Medical conditions present ─────────────────────────
    if data.hearing_history.medical_conditions == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-HIST-004".to_string(),
            category: "Hearing History".to_string(),
            message: "Relevant medical conditions reported - coordinate with treating physician".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Additional services needed ─────────────────────────
    if !data.clinical_review.additional_services_needed.trim().is_empty()
        && data.clinical_review.additional_services_needed != "none"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CLIN-001".to_string(),
            category: "Clinical".to_string(),
            message: "Additional services requested - review and schedule".to_string(),
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
