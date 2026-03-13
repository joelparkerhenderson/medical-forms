use super::types::{AdditionalFlag, AssessmentData};
use super::utils::{calculate_four_at_score, calculate_gds_score, calculate_tinetti_score};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the frailty score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Falls prevention programme needed ───────────────────
    if data.falls_risk.falls_last_12_months.unwrap_or(0) >= 2
        || (data.falls_risk.falls_last_12_months.unwrap_or(0) >= 1
            && data.falls_risk.fear_of_falling == "yes")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-FALL-001".to_string(),
            category: "Falls".to_string(),
            message: "Falls prevention programme recommended - recurrent falls or falls with fear of falling".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Medication review needed (>=10 meds) ────────────────
    if data.medication_review.total_medications.unwrap_or(0) >= 10 {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-001".to_string(),
            category: "Medication".to_string(),
            message: "Urgent medication review needed - extreme polypharmacy (>= 10 medications)".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Delirium screening positive ─────────────────────────
    if calculate_four_at_score(data).is_some_and(|s| s >= 4) {
        flags.push(AdditionalFlag {
            id: "FLAG-DEL-001".to_string(),
            category: "Cognitive".to_string(),
            message: "4AT score >= 4 - possible delirium, urgent medical review required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Safeguarding concern ────────────────────────────────
    if data.social_circumstances.safeguarding_concerns == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SAFE-001".to_string(),
            category: "Safeguarding".to_string(),
            message: "Safeguarding concern identified - follow local safeguarding procedures".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Carer stress ────────────────────────────────────────
    if data.social_circumstances.carer_stress == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-CARE-001".to_string(),
            category: "Carer".to_string(),
            message: "Carer stress identified - consider carer assessment and respite options".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Care home assessment needed ─────────────────────────
    if data.clinical_review.clinical_frailty_scale.unwrap_or(0) >= 7
        && data.social_circumstances.lives_alone == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-HOME-001".to_string(),
            category: "Placement".to_string(),
            message: "Severely frail and living alone - care home assessment may be needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Advance care planning ───────────────────────────────
    if data.social_circumstances.advance_care_plan == "no"
        && data.clinical_review.clinical_frailty_scale.unwrap_or(0) >= 5
    {
        flags.push(AdditionalFlag {
            id: "FLAG-ACP-001".to_string(),
            category: "Planning".to_string(),
            message: "No advance care plan in place for frail patient - discuss advance care planning".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Driving assessment needed ───────────────────────────
    if data.social_circumstances.driving_status == "drives"
        && (data.cognitive_screening.mmse_score.unwrap_or(30) <= 24
            || data.cognitive_screening.known_dementia_diagnosis == "yes")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-DRIVE-001".to_string(),
            category: "Safety".to_string(),
            message: "Cognitive impairment in active driver - driving assessment recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Moderate polypharmacy ────────────────────────────────
    if matches!(data.medication_review.total_medications, Some(5..=9)) {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-002".to_string(),
            category: "Medication".to_string(),
            message: "Polypharmacy (5-9 medications) - consider medication review".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── High-risk medications ───────────────────────────────
    if data.medication_review.high_risk_medications == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-003".to_string(),
            category: "Medication".to_string(),
            message: "High-risk medications identified (anticoagulants, opioids, insulin, etc.)".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Pressure ulcer risk ─────────────────────────────────
    if data.clinical_review.pressure_ulcer_risk == "high" {
        flags.push(AdditionalFlag {
            id: "FLAG-SKIN-001".to_string(),
            category: "Skin".to_string(),
            message: "High pressure ulcer risk - implement prevention measures".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Tinetti high fall risk ──────────────────────────────
    if calculate_tinetti_score(data).is_some_and(|s| s <= 5) {
        flags.push(AdditionalFlag {
            id: "FLAG-FALL-002".to_string(),
            category: "Falls".to_string(),
            message: "Tinetti balance score <= 5 - high fall risk, physiotherapy referral recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Depression screening positive ───────────────────────
    if calculate_gds_score(data) >= 10 {
        flags.push(AdditionalFlag {
            id: "FLAG-MOOD-001".to_string(),
            category: "Mood".to_string(),
            message: "GDS-15 score >= 10 - significant depression, consider psychiatric referral".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Palliative care needs ───────────────────────────────
    if data.clinical_review.palliative_care_needs == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-PALL-001".to_string(),
            category: "Palliative".to_string(),
            message: "Palliative care needs identified - refer to palliative care team".to_string(),
            priority: "medium".to_string(),
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
