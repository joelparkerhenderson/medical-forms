use super::types::AssessmentData;

/// Returns a human-readable label for an impairment level.
pub fn impairment_level_label(level: &str) -> &str {
    match level {
        "blind" => "Blind",
        "severeImpairment" => "Severe Impairment",
        "moderateImpairment" => "Moderate Impairment",
        "mildImpairment" => "Mild Impairment",
        "normal" => "Normal",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all 1-5 clinical grading items from the assessment data.
/// These are the numeric Option<u8> fields used for scoring.
pub fn collect_clinical_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Anterior Segment (12 items)
        data.anterior_segment.right_lids,
        data.anterior_segment.left_lids,
        data.anterior_segment.right_conjunctiva,
        data.anterior_segment.left_conjunctiva,
        data.anterior_segment.right_cornea,
        data.anterior_segment.left_cornea,
        data.anterior_segment.right_anterior_chamber,
        data.anterior_segment.left_anterior_chamber,
        data.anterior_segment.right_iris,
        data.anterior_segment.left_iris,
        data.anterior_segment.right_lens,
        data.anterior_segment.left_lens,
        // Posterior Segment (10 items)
        data.posterior_segment.right_optic_disc,
        data.posterior_segment.left_optic_disc,
        data.posterior_segment.right_macula,
        data.posterior_segment.left_macula,
        data.posterior_segment.right_vessels,
        data.posterior_segment.left_vessels,
        data.posterior_segment.right_peripheral_retina,
        data.posterior_segment.left_peripheral_retina,
        data.posterior_segment.right_vitreous,
        data.posterior_segment.left_vitreous,
        // Visual Fields (3 items)
        data.visual_fields.right_confrontation,
        data.visual_fields.left_confrontation,
        data.visual_fields.visual_field_reliability,
        // Ocular Motility (5 items)
        data.ocular_motility.extraocular_movements,
        data.ocular_motility.pupil_right_direct,
        data.ocular_motility.pupil_left_direct,
        data.ocular_motility.pupil_right_consensual,
        data.ocular_motility.pupil_left_consensual,
        data.ocular_motility.convergence,
    ]
}

/// Calculate the composite clinical score (0-100) from all answered clinical items.
/// Scale: 1 = severely abnormal, 5 = normal.
/// Returns None if no items are answered.
pub fn calculate_composite_score(data: &AssessmentData) -> Option<f64> {
    let items = collect_clinical_items(data);
    let answered: Vec<u8> = items.into_iter().flatten().collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    // Convert 1-5 scale to 0-100
    let score = ((avg - 1.0) / 4.0) * 100.0;
    Some(score.round())
}

/// Calculate the dimension score (0-100) for a set of clinical items.
pub fn dimension_score(items: &[Option<u8>]) -> Option<f64> {
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    Some(((avg - 1.0) / 4.0) * 100.0)
}

/// Get the anterior segment dimension score.
pub fn anterior_segment_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.anterior_segment.right_lids,
        data.anterior_segment.left_lids,
        data.anterior_segment.right_conjunctiva,
        data.anterior_segment.left_conjunctiva,
        data.anterior_segment.right_cornea,
        data.anterior_segment.left_cornea,
        data.anterior_segment.right_anterior_chamber,
        data.anterior_segment.left_anterior_chamber,
        data.anterior_segment.right_iris,
        data.anterior_segment.left_iris,
        data.anterior_segment.right_lens,
        data.anterior_segment.left_lens,
    ])
}

/// Get the posterior segment dimension score.
pub fn posterior_segment_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.posterior_segment.right_optic_disc,
        data.posterior_segment.left_optic_disc,
        data.posterior_segment.right_macula,
        data.posterior_segment.left_macula,
        data.posterior_segment.right_vessels,
        data.posterior_segment.left_vessels,
        data.posterior_segment.right_peripheral_retina,
        data.posterior_segment.left_peripheral_retina,
        data.posterior_segment.right_vitreous,
        data.posterior_segment.left_vitreous,
    ])
}

/// Classify visual acuity using Snellen notation.
/// Returns a severity category: "normal", "mild", "moderate", "severe", "blind", or "unknown".
pub fn classify_visual_acuity(snellen: &str) -> &'static str {
    match snellen {
        "6/6" | "6/5" | "6/9" => "normal",
        "6/12" | "6/18" => "mild",
        "6/24" | "6/36" | "6/60" => "moderate",
        "3/60" | "1/60" => "severe",
        "CF" | "HM" | "PL" | "NPL" => "blind",
        _ => "unknown",
    }
}

/// Parse IOP value and classify risk.
pub fn iop_risk(iop: Option<u8>) -> &'static str {
    match iop {
        Some(0..=10) => "low",
        Some(11..=21) => "normal",
        Some(22..=30) => "elevated",
        Some(31..) => "high",
        None => "unknown",
    }
}
