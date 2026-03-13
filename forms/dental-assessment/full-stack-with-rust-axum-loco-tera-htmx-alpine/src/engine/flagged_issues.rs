use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the oral health status. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── FLAG-CANCER-001: Suspicious oral lesion ─────────────
    if data.oral_examination.oral_cancer_screening == "suspicious"
        || data.oral_examination.oral_cancer_screening == "referral"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CANCER-001".to_string(),
            category: "Oral Cancer".to_string(),
            message: "Suspicious oral lesion detected - 2-week urgent referral required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-PERIO-001: Severe periodontitis ────────────────
    if data.periodontal_assessment.periodontal_diagnosis == "severePeriodontitis" {
        flags.push(AdditionalFlag {
            id: "FLAG-PERIO-001".to_string(),
            category: "Periodontal".to_string(),
            message: "Severe periodontitis - specialist periodontal referral recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-PERIO-002: Rapid periodontal deterioration ─────
    if data.periodontal_assessment.clinical_attachment_loss == "yes"
        && data.periodontal_assessment.gingival_bleeding == "yes"
        && data.periodontal_assessment.mobility_present == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-PERIO-002".to_string(),
            category: "Periodontal".to_string(),
            message: "Rapid periodontal deterioration - bleeding, attachment loss, and mobility".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-CARIES-001: Multiple active caries ─────────────
    if data.caries_assessment.active_caries == "yes"
        && data.caries_assessment.decayed_teeth.is_some_and(|d| d >= 3)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CARIES-001".to_string(),
            category: "Caries".to_string(),
            message: "Multiple active caries - comprehensive restorative plan needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-PAIN-001: Acute dental pain ────────────────────
    if data.treatment_needs.urgent_treatment == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-PAIN-001".to_string(),
            category: "Pain".to_string(),
            message: "Urgent treatment required - prioritise pain relief".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-TMJ-001: TMJ dysfunction ───────────────────────
    if data.occlusion_tmj.limited_opening == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-TMJ-001".to_string(),
            category: "TMJ".to_string(),
            message: "Limited mouth opening - TMJ dysfunction assessment required".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-WEAR-001: Severe tooth wear ────────────────────
    if data.occlusion_tmj.tooth_wear.is_some_and(|w| w >= 3) {
        flags.push(AdditionalFlag {
            id: "FLAG-WEAR-001".to_string(),
            category: "Tooth Wear".to_string(),
            message: "Severe tooth wear (grade 3-4) - restorative intervention needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-ABSCESS-001: Periapical abscess ────────────────
    if data.radiographic_findings.periapical_lesions == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-ABSCESS-001".to_string(),
            category: "Endodontic".to_string(),
            message: "Periapical lesion detected - endodontic assessment required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-MOBILE-001: Mobile teeth ───────────────────────
    if data.periodontal_assessment.mobility_present == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-MOBILE-001".to_string(),
            category: "Periodontal".to_string(),
            message: "Mobile teeth present - risk of tooth loss".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-HYG-001: Poor oral hygiene ─────────────────────
    if data.oral_hygiene.brushing_frequency == "never"
        || data.oral_hygiene.brushing_frequency == "rarely"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-HYG-001".to_string(),
            category: "Oral Hygiene".to_string(),
            message: "Poor oral hygiene - oral health education and motivation required".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-SMOKE-001: Smoker ──────────────────────────────
    if data.oral_hygiene.smoking_status == "current" {
        flags.push(AdditionalFlag {
            id: "FLAG-SMOKE-001".to_string(),
            category: "Lifestyle".to_string(),
            message: "Current smoker - smoking cessation advice should be provided".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-ANXI-001: Severe dental anxiety ────────────────
    if data.dental_history.dental_anxiety.is_some_and(|a| a >= 4) {
        flags.push(AdditionalFlag {
            id: "FLAG-ANXI-001".to_string(),
            category: "Anxiety".to_string(),
            message: "Severe dental anxiety - sedation or specialist referral may be needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-RADIO-001: Significant radiographic findings ───
    if data.radiographic_findings.bone_loss == "yes"
        || data.radiographic_findings.impacted_teeth == "yes"
        || !data.radiographic_findings.other_findings.trim().is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-RADIO-001".to_string(),
            category: "Radiographic".to_string(),
            message: "Significant radiographic findings requiring review".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-CHILD-001: Paediatric high caries risk ─────────
    if data.caries_assessment.caries_risk == "high"
        && data.dental_history.dental_phobia == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CHILD-001".to_string(),
            category: "Paediatric".to_string(),
            message: "High caries risk with dental phobia - paediatric/specialist management".to_string(),
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
