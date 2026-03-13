use super::types::{AdditionalFlag, AssessmentData};
use super::utils::calculate_nihss_total;

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the severity score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── FLAG-ACUTE-001: Acute stroke in thrombolysis window ───
    if data.stroke_classification.stroke_type == "ischaemic"
        && data.event_details.stroke_code == "yes"
        && calculate_nihss_total(data).is_some_and(|t| t >= 5)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-ACUTE-001".to_string(),
            category: "Acute".to_string(),
            message: "Acute ischaemic stroke - assess for thrombolysis window".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-ACUTE-002: Large vessel occlusion ────────────────
    if data.stroke_classification.bamford_classification == "taci"
        && data.acute_treatment.thrombectomy != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-ACUTE-002".to_string(),
            category: "Acute".to_string(),
            message: "Large vessel occlusion (TACI) - consider thrombectomy candidacy".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-HAEM-001: Haemorrhagic stroke ────────────────────
    if data.stroke_classification.stroke_type == "haemorrhagic" {
        flags.push(AdditionalFlag {
            id: "FLAG-HAEM-001".to_string(),
            category: "Haemorrhagic".to_string(),
            message: "Haemorrhagic stroke identified - neurosurgical review required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-CONS-001: Reduced consciousness ──────────────────
    if data.nihss_assessment.consciousness.is_some_and(|v| v >= 2) {
        flags.push(AdditionalFlag {
            id: "FLAG-CONS-001".to_string(),
            category: "Consciousness".to_string(),
            message: "Significantly reduced consciousness - urgent medical review".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-SWALL-001: Failed swallow assessment ─────────────
    if data.acute_treatment.swallow_assessment == "fail" {
        flags.push(AdditionalFlag {
            id: "FLAG-SWALL-001".to_string(),
            category: "Swallowing".to_string(),
            message: "Failed swallow assessment - aspiration risk, nil by mouth".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-AF-001: New atrial fibrillation ──────────────────
    if data.risk_factors.atrial_fibrillation == "yes"
        && data.secondary_prevention.anticoagulation_indicated != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-AF-001".to_string(),
            category: "Cardiac".to_string(),
            message: "Atrial fibrillation detected - anticoagulation assessment needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-CAROT-001: Significant carotid stenosis ──────────
    if !data.risk_factors.carotid_stenosis.is_empty()
        && data.risk_factors.carotid_stenosis != "none"
        && data.risk_factors.carotid_stenosis != "no"
        && data.secondary_prevention.carotid_endarterectomy.is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CAROT-001".to_string(),
            category: "Vascular".to_string(),
            message: "Significant carotid stenosis - surgical referral required".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-RECUR-001: Recurrent stroke/TIA ──────────────────
    if data.risk_factors.previous_stroke == "yes" || data.risk_factors.previous_tia == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-RECUR-001".to_string(),
            category: "Recurrence".to_string(),
            message: "Recurrent stroke or TIA - review secondary prevention urgently".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-BP-001: Hypertensive emergency ───────────────────
    if data.risk_factors.hypertension == "yes"
        && data.acute_treatment.bp_management.is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-BP-001".to_string(),
            category: "Blood Pressure".to_string(),
            message: "Hypertension with no BP management plan documented".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-FUNC-001: Severe functional impairment ───────────
    if data.functional_assessment.modified_rankin_score.is_some_and(|v| v >= 4) {
        flags.push(AdditionalFlag {
            id: "FLAG-FUNC-001".to_string(),
            category: "Functional".to_string(),
            message: "Severe functional impairment (mRS >= 4) - intensive rehabilitation needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-MOOD-001: Post-stroke depression ─────────────────
    if data.functional_assessment.mood_screening == "abnormal"
        || data.functional_assessment.mood_screening == "depressed"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MOOD-001".to_string(),
            category: "Mental Health".to_string(),
            message: "Abnormal mood screening - assess for post-stroke depression".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-DRIVE-001: Driving advice needed ─────────────────
    if data.secondary_prevention.driving_advice != "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-DRIVE-001".to_string(),
            category: "Driving".to_string(),
            message: "Driving advice not documented - DVLA notification may be required".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── FLAG-PREV-001: Secondary prevention not optimised ─────
    if data.secondary_prevention.antiplatelet_therapy.is_empty()
        && data.secondary_prevention.anticoagulation_indicated != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-PREV-001".to_string(),
            category: "Prevention".to_string(),
            message: "No antithrombotic therapy documented - review secondary prevention".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-REHAB-001: Rehabilitation needs not addressed ────
    if data.functional_assessment.modified_rankin_score.is_some_and(|v| v >= 2)
        && data.clinical_review.referrals.is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-REHAB-001".to_string(),
            category: "Rehabilitation".to_string(),
            message: "Functional impairment with no rehabilitation referrals documented".to_string(),
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
