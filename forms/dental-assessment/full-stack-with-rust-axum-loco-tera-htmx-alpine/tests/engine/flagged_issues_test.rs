use dental_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use dental_assessment_tera_crate::engine::types::*;

fn create_good_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.full_name = "John Smith".to_string();
    data.dental_history.last_dental_visit = "lessThan6Months".to_string();
    data.dental_history.visit_frequency = "every6Months".to_string();
    data.dental_history.dental_anxiety = Some(1);
    data.dental_history.dental_phobia = "no".to_string();

    data.oral_examination.soft_tissue_normal = "yes".to_string();
    data.oral_examination.oral_cancer_screening = "normal".to_string();

    data.periodontal_assessment.periodontal_diagnosis = "healthy".to_string();
    data.periodontal_assessment.gingival_bleeding = "no".to_string();
    data.periodontal_assessment.clinical_attachment_loss = "no".to_string();
    data.periodontal_assessment.mobility_present = "no".to_string();

    data.caries_assessment.decayed_teeth = Some(0);
    data.caries_assessment.missing_teeth = Some(1);
    data.caries_assessment.filled_teeth = Some(2);
    data.caries_assessment.active_caries = "no".to_string();
    data.caries_assessment.caries_risk = "low".to_string();

    data.occlusion_tmj.tmj_pain = "no".to_string();
    data.occlusion_tmj.limited_opening = "no".to_string();
    data.occlusion_tmj.tooth_wear = Some(0);
    data.occlusion_tmj.bruxism = "no".to_string();

    data.oral_hygiene.brushing_frequency = "twiceDaily".to_string();
    data.oral_hygiene.smoking_status = "never".to_string();

    data.radiographic_findings.bone_loss = "no".to_string();
    data.radiographic_findings.periapical_lesions = "no".to_string();
    data.radiographic_findings.impacted_teeth = "no".to_string();

    data.treatment_needs.urgent_treatment = "no".to_string();

    data
}

#[test]
fn no_flags_for_healthy_patient() {
    let data = create_good_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_suspicious_oral_lesion() {
    let mut data = create_good_assessment();
    data.oral_examination.oral_cancer_screening = "suspicious".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CANCER-001"));
}

#[test]
fn flags_severe_periodontitis() {
    let mut data = create_good_assessment();
    data.periodontal_assessment.periodontal_diagnosis = "severePeriodontitis".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PERIO-001"));
}

#[test]
fn flags_urgent_treatment() {
    let mut data = create_good_assessment();
    data.treatment_needs.urgent_treatment = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PAIN-001"));
}

#[test]
fn flags_mobile_teeth() {
    let mut data = create_good_assessment();
    data.periodontal_assessment.mobility_present = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MOBILE-001"));
}

#[test]
fn flags_smoker() {
    let mut data = create_good_assessment();
    data.oral_hygiene.smoking_status = "current".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SMOKE-001"));
}

#[test]
fn flags_severe_dental_anxiety() {
    let mut data = create_good_assessment();
    data.dental_history.dental_anxiety = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ANXI-001"));
}

#[test]
fn flags_periapical_lesion() {
    let mut data = create_good_assessment();
    data.radiographic_findings.periapical_lesions = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ABSCESS-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_good_assessment();
    // Create flags of different priorities
    data.periodontal_assessment.mobility_present = "yes".to_string(); // high (FLAG-MOBILE-001)
    data.oral_hygiene.smoking_status = "current".to_string(); // medium (FLAG-SMOKE-001)
    data.occlusion_tmj.limited_opening = "yes".to_string(); // medium (FLAG-TMJ-001)

    let flags = detect_additional_flags(&data);
    let priorities: Vec<&str> = flags.iter().map(|f| f.priority.as_str()).collect();
    let mut sorted = priorities.clone();
    sorted.sort_by_key(|p| match *p {
        "high" => 0,
        "medium" => 1,
        "low" => 2,
        _ => 3,
    });
    assert_eq!(priorities, sorted);
}
