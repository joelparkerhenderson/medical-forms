use super::types::AssessmentData;

/// Returns a human-readable label for an oral health status.
pub fn oral_health_status_label(status: &str) -> &str {
    match status {
        "good" => "Good",
        "fair" => "Fair",
        "poor" => "Poor",
        "urgent" => "Urgent",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Calculate the DMFT score (Decayed + Missing + Filled Teeth).
/// Returns None if no component has been entered.
pub fn calculate_dmft(data: &AssessmentData) -> Option<u8> {
    let d = data.caries_assessment.decayed_teeth;
    let m = data.caries_assessment.missing_teeth;
    let f = data.caries_assessment.filled_teeth;

    if d.is_none() && m.is_none() && f.is_none() {
        return None;
    }

    Some(d.unwrap_or(0) + m.unwrap_or(0) + f.unwrap_or(0))
}

/// Count the number of answered clinical fields for minimum-data check.
/// We consider key clinical indicators across periodontal, caries, and treatment sections.
pub fn count_answered_fields(data: &AssessmentData) -> usize {
    let mut count = 0;

    // Periodontal fields
    if !data.periodontal_assessment.periodontal_diagnosis.is_empty() { count += 1; }
    if !data.periodontal_assessment.bpe_score.is_empty() { count += 1; }
    if !data.periodontal_assessment.gingival_bleeding.is_empty() { count += 1; }
    if data.periodontal_assessment.pocket_depth_max.is_some() { count += 1; }
    if !data.periodontal_assessment.clinical_attachment_loss.is_empty() { count += 1; }
    if !data.periodontal_assessment.mobility_present.is_empty() { count += 1; }

    // Caries fields
    if data.caries_assessment.decayed_teeth.is_some() { count += 1; }
    if data.caries_assessment.missing_teeth.is_some() { count += 1; }
    if data.caries_assessment.filled_teeth.is_some() { count += 1; }
    if !data.caries_assessment.active_caries.is_empty() { count += 1; }
    if !data.caries_assessment.caries_risk.is_empty() { count += 1; }

    // Oral examination
    if !data.oral_examination.oral_cancer_screening.is_empty() { count += 1; }
    if !data.oral_examination.soft_tissue_normal.is_empty() { count += 1; }

    // Occlusion & TMJ
    if !data.occlusion_tmj.tmj_pain.is_empty() { count += 1; }
    if !data.occlusion_tmj.bruxism.is_empty() { count += 1; }
    if data.occlusion_tmj.tooth_wear.is_some() { count += 1; }

    // Oral hygiene
    if !data.oral_hygiene.brushing_frequency.is_empty() { count += 1; }
    if !data.oral_hygiene.dietary_sugar.is_empty() { count += 1; }
    if !data.oral_hygiene.smoking_status.is_empty() { count += 1; }

    // Treatment needs
    if !data.treatment_needs.urgent_treatment.is_empty() { count += 1; }

    // Radiographic findings
    if !data.radiographic_findings.bone_loss.is_empty() { count += 1; }
    if !data.radiographic_findings.periapical_lesions.is_empty() { count += 1; }

    count
}

/// Determine the oral health status based on composite assessment.
/// Returns "draft" if insufficient data, otherwise good/fair/poor/urgent.
pub fn determine_oral_health_status(data: &AssessmentData) -> String {
    let answered = count_answered_fields(data);
    if answered < 5 {
        return "draft".to_string();
    }

    let mut severity_score: u32 = 0;

    // Periodontal diagnosis contributes heavily
    match data.periodontal_assessment.periodontal_diagnosis.as_str() {
        "severePeriodontitis" => severity_score += 40,
        "moderatePeriodontitis" => severity_score += 25,
        "mildPeriodontitis" => severity_score += 15,
        "gingivitis" => severity_score += 8,
        "healthy" => severity_score += 0,
        _ => {}
    }

    // DMFT score
    if let Some(dmft) = calculate_dmft(data) {
        if dmft >= 20 {
            severity_score += 30;
        } else if dmft >= 15 {
            severity_score += 20;
        } else if dmft >= 10 {
            severity_score += 12;
        } else if dmft >= 5 {
            severity_score += 5;
        }
    }

    // Active caries
    if data.caries_assessment.active_caries == "yes" {
        severity_score += 10;
    }

    // Caries risk
    match data.caries_assessment.caries_risk.as_str() {
        "high" => severity_score += 10,
        "moderate" => severity_score += 5,
        _ => {}
    }

    // Urgent treatment needed
    if data.treatment_needs.urgent_treatment == "yes" {
        severity_score += 15;
    }

    // Cancer screening
    match data.oral_examination.oral_cancer_screening.as_str() {
        "referral" => severity_score += 30,
        "suspicious" => severity_score += 20,
        _ => {}
    }

    // Mobility
    if data.periodontal_assessment.mobility_present == "yes" {
        severity_score += 10;
    }

    // Bone loss > 30%
    if let Some(pct) = data.radiographic_findings.bone_loss_percentage {
        if pct > 30 {
            severity_score += 10;
        }
    }

    // Periapical lesions
    if data.radiographic_findings.periapical_lesions == "yes" {
        severity_score += 10;
    }

    // Smoking
    if data.oral_hygiene.smoking_status == "current" {
        severity_score += 5;
    }

    // Determine status from severity score
    if severity_score >= 50 {
        "urgent".to_string()
    } else if severity_score >= 30 {
        "poor".to_string()
    } else if severity_score >= 10 {
        "fair".to_string()
    } else {
        "good".to_string()
    }
}
