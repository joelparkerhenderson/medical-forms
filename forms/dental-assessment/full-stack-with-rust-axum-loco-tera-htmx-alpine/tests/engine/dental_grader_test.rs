use dental_assessment_tera_crate::engine::dental_grader::calculate_oral_health;
use dental_assessment_tera_crate::engine::dental_rules::all_rules;
use dental_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_good_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.full_name = "John Smith".to_string();
    data.patient_information.date_of_birth = "1985-06-15".to_string();
    data.patient_information.nhs_number = "123 456 7890".to_string();
    data.patient_information.dental_practice = "High Street Dental".to_string();

    // Dental History
    data.dental_history.last_dental_visit = "lessThan6Months".to_string();
    data.dental_history.visit_frequency = "every6Months".to_string();
    data.dental_history.dental_anxiety = Some(1);
    data.dental_history.previous_surgery = "no".to_string();
    data.dental_history.dental_trauma = "no".to_string();
    data.dental_history.dental_phobia = "no".to_string();

    // Oral Examination
    data.oral_examination.soft_tissue_normal = "yes".to_string();
    data.oral_examination.oral_cancer_screening = "normal".to_string();
    data.oral_examination.mucosal_lesions = "no".to_string();
    data.oral_examination.tongue_condition = "normal".to_string();
    data.oral_examination.salivary_flow = "normal".to_string();

    // Periodontal Assessment - healthy
    data.periodontal_assessment.bpe_score = "0".to_string();
    data.periodontal_assessment.gingival_bleeding = "no".to_string();
    data.periodontal_assessment.pocket_depth_max = Some(3);
    data.periodontal_assessment.clinical_attachment_loss = "no".to_string();
    data.periodontal_assessment.mobility_present = "no".to_string();
    data.periodontal_assessment.furcation_involvement = "no".to_string();
    data.periodontal_assessment.periodontal_diagnosis = "healthy".to_string();

    // Caries Assessment - low risk, DMFT = 3
    data.caries_assessment.decayed_teeth = Some(0);
    data.caries_assessment.missing_teeth = Some(1);
    data.caries_assessment.filled_teeth = Some(2);
    data.caries_assessment.active_caries = "no".to_string();
    data.caries_assessment.caries_risk = "low".to_string();
    data.caries_assessment.root_caries = "no".to_string();
    data.caries_assessment.secondary_caries = "no".to_string();

    // Occlusion & TMJ
    data.occlusion_tmj.occlusion_class = "classI".to_string();
    data.occlusion_tmj.tmj_pain = "no".to_string();
    data.occlusion_tmj.tmj_clicking = "no".to_string();
    data.occlusion_tmj.limited_opening = "no".to_string();
    data.occlusion_tmj.bruxism = "no".to_string();
    data.occlusion_tmj.tooth_wear = Some(0);

    // Oral Hygiene - good
    data.oral_hygiene.brushing_frequency = "twiceDaily".to_string();
    data.oral_hygiene.brush_type = "electric".to_string();
    data.oral_hygiene.interdental_cleaning = "yes".to_string();
    data.oral_hygiene.dietary_sugar = "low".to_string();
    data.oral_hygiene.smoking_status = "never".to_string();

    // Radiographic Findings - normal
    data.radiographic_findings.radiographs_taken = "yes".to_string();
    data.radiographic_findings.bone_loss = "no".to_string();
    data.radiographic_findings.periapical_lesions = "no".to_string();
    data.radiographic_findings.impacted_teeth = "no".to_string();

    // Treatment Needs - minimal
    data.treatment_needs.fillings = Some(0);
    data.treatment_needs.extractions = Some(0);
    data.treatment_needs.root_canals = Some(0);
    data.treatment_needs.crowns = Some(0);
    data.treatment_needs.urgent_treatment = "no".to_string();

    // Clinical Review
    data.clinical_review.clinician_name = "Dr Williams".to_string();
    data.clinical_review.review_date = "2026-03-09".to_string();
    data.clinical_review.overall_status = "good".to_string();
    data.clinical_review.dmft_score = Some(3);

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (status, dmft, fired_rules) = calculate_oral_health(&data);
    assert_eq!(status, "draft");
    assert!(dmft.is_none());
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_good_for_healthy_patient() {
    let data = create_good_assessment();
    let (status, dmft, _fired_rules) = calculate_oral_health(&data);
    assert_eq!(status, "good");
    assert_eq!(dmft, Some(3)); // 0 + 1 + 2 = 3
}

#[test]
fn returns_urgent_for_severe_periodontitis_with_mobility() {
    let mut data = create_good_assessment();
    data.periodontal_assessment.periodontal_diagnosis = "severePeriodontitis".to_string();
    data.periodontal_assessment.mobility_present = "yes".to_string();
    data.treatment_needs.urgent_treatment = "yes".to_string();

    let (status, _dmft, fired_rules) = calculate_oral_health(&data);
    assert_eq!(status, "urgent");
    assert!(fired_rules.iter().any(|r| r.id == "DENT-002")); // severe perio
    assert!(fired_rules.iter().any(|r| r.id == "DENT-005")); // mobility
}

#[test]
fn returns_poor_for_high_caries_risk_with_active_caries() {
    let mut data = create_good_assessment();
    data.caries_assessment.decayed_teeth = Some(5);
    data.caries_assessment.missing_teeth = Some(3);
    data.caries_assessment.filled_teeth = Some(8);
    data.caries_assessment.active_caries = "yes".to_string();
    data.caries_assessment.caries_risk = "high".to_string();
    data.treatment_needs.urgent_treatment = "yes".to_string();

    let (status, dmft, fired_rules) = calculate_oral_health(&data);
    assert_eq!(dmft, Some(16)); // 5 + 3 + 8
    assert!(status == "poor" || status == "urgent");
    assert!(fired_rules.iter().any(|r| r.id == "DENT-003")); // active caries + urgent
    assert!(fired_rules.iter().any(|r| r.id == "DENT-007")); // high caries risk
}

#[test]
fn fires_cancer_screening_rule() {
    let mut data = create_good_assessment();
    data.oral_examination.oral_cancer_screening = "suspicious".to_string();

    let (_status, _dmft, fired_rules) = calculate_oral_health(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DENT-001"));
}

#[test]
fn fires_periapical_lesion_rule() {
    let mut data = create_good_assessment();
    data.radiographic_findings.periapical_lesions = "yes".to_string();

    let (_status, _dmft, fired_rules) = calculate_oral_health(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DENT-004"));
}

#[test]
fn fires_low_dmft_positive_rule() {
    let data = create_good_assessment();
    let (_status, _dmft, fired_rules) = calculate_oral_health(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DENT-020")); // DMFT < 5
}

#[test]
fn fires_healthy_periodontium_positive_rule() {
    let data = create_good_assessment();
    let (_status, _dmft, fired_rules) = calculate_oral_health(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DENT-016")); // healthy perio
}

#[test]
fn fires_good_oral_hygiene_positive_rule() {
    let data = create_good_assessment();
    let (_status, _dmft, fired_rules) = calculate_oral_health(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DENT-018")); // good hygiene
}

#[test]
fn fires_regular_attendance_positive_rule() {
    let data = create_good_assessment();
    let (_status, _dmft, fired_rules) = calculate_oral_health(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DENT-019")); // regular attendance
}

#[test]
fn all_rule_ids_are_unique() {
    let rules = all_rules();
    let ids: Vec<&str> = rules.iter().map(|r| r.id).collect();
    let mut unique_ids = ids.clone();
    unique_ids.sort();
    unique_ids.dedup();
    assert_eq!(unique_ids.len(), ids.len());
}

#[test]
fn returns_fair_for_moderate_issues() {
    let mut data = create_good_assessment();
    data.periodontal_assessment.periodontal_diagnosis = "gingivitis".to_string();
    data.caries_assessment.caries_risk = "moderate".to_string();
    data.caries_assessment.decayed_teeth = Some(2);
    data.caries_assessment.missing_teeth = Some(2);
    data.caries_assessment.filled_teeth = Some(4);

    let (status, dmft, _fired_rules) = calculate_oral_health(&data);
    assert_eq!(status, "fair");
    assert_eq!(dmft, Some(8)); // 2 + 2 + 4
}
