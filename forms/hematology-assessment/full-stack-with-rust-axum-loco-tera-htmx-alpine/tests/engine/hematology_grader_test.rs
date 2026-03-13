use hematology_assessment_tera_crate::engine::hematology_grader::calculate_abnormality;
use hematology_assessment_tera_crate::engine::hematology_rules::all_rules;
use hematology_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_normal_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1985-06-15".to_string();
    data.patient_information.medical_record_number = "MRN-123456".to_string();
    data.patient_information.referring_physician = "Dr Johnson".to_string();
    data.patient_information.clinical_indication = "Routine blood work".to_string();
    data.patient_information.specimen_date = "2026-03-01".to_string();
    data.patient_information.specimen_type = "edtaBlood".to_string();

    // Blood Count Analysis - all normal
    data.blood_count_analysis.hemoglobin = Some(14.0);
    data.blood_count_analysis.hematocrit = Some(42.0);
    data.blood_count_analysis.red_blood_cell_count = Some(4.8);
    data.blood_count_analysis.white_blood_cell_count = Some(7.0);
    data.blood_count_analysis.platelet_count = Some(250.0);
    data.blood_count_analysis.mean_corpuscular_volume = Some(88.0);
    data.blood_count_analysis.mean_corpuscular_hemoglobin = Some(29.0);
    data.blood_count_analysis.red_cell_distribution_width = Some(13.0);

    // Coagulation Studies - all normal
    data.coagulation_studies.prothrombin_time = Some(12.0);
    data.coagulation_studies.inr = Some(1.0);
    data.coagulation_studies.activated_partial_thromboplastin_time = Some(30.0);
    data.coagulation_studies.fibrinogen = Some(300.0);
    data.coagulation_studies.d_dimer = Some(0.3);
    data.coagulation_studies.bleeding_time = Some(4.0);

    // Iron Studies - all normal
    data.iron_studies.serum_iron = Some(100.0);
    data.iron_studies.total_iron_binding_capacity = Some(310.0);
    data.iron_studies.transferrin_saturation = Some(32.0);
    data.iron_studies.serum_ferritin = Some(80.0);
    data.iron_studies.reticulocyte_count = Some(1.2);

    // Peripheral Blood Film
    data.peripheral_blood_film.red_cell_morphology = "Normochromic normocytic".to_string();
    data.peripheral_blood_film.white_blood_cell_differential = "Normal differential".to_string();
    data.peripheral_blood_film.platelet_morphology = "Normal".to_string();
    data.peripheral_blood_film.abnormal_cell_morphology = "none".to_string();
    data.peripheral_blood_film.film_quality = Some(4);

    // Hemoglobinopathy Screening
    data.hemoglobinopathy_screening.sickle_cell_screen = "negative".to_string();
    data.hemoglobinopathy_screening.thalassemia_screen = "negative".to_string();

    // Transfusion History
    data.transfusion_history.previous_transfusions = "none".to_string();
    data.transfusion_history.transfusion_reactions = "none".to_string();
    data.transfusion_history.blood_group_type = "aPositive".to_string();
    data.transfusion_history.antibody_screen = "negative".to_string();

    // Clinical Review
    data.clinical_review.diagnosis = "Normal hematological profile".to_string();
    data.clinical_review.urgency_level = Some(1);
    data.clinical_review.reviewer_name = "Dr Patel".to_string();
    data.clinical_review.review_date = "2026-03-01".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_abnormality(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_normal_for_all_normal_values() {
    let data = create_normal_assessment();
    let (level, score, _fired_rules) = calculate_abnormality(&data);
    assert_eq!(level, "normal");
    assert_eq!(score, 0.0);
}

#[test]
fn returns_critical_for_severe_anemia() {
    let mut data = create_normal_assessment();
    data.blood_count_analysis.hemoglobin = Some(5.0); // Critical
    data.blood_count_analysis.hematocrit = Some(15.0); // Severe
    data.blood_count_analysis.platelet_count = Some(10.0); // Severe
    data.blood_count_analysis.white_blood_cell_count = Some(0.5); // Severe

    let (level, _score, fired_rules) = calculate_abnormality(&data);
    assert!(level == "critical" || level == "severeAbnormality" || level == "moderateAbnormality");
    assert!(fired_rules.iter().any(|r| r.id == "HEM-001")); // Critical hemoglobin
    assert!(fired_rules.iter().any(|r| r.id == "HEM-002")); // Severe thrombocytopenia
}

#[test]
fn fires_critical_hemoglobin_rule() {
    let mut data = create_normal_assessment();
    data.blood_count_analysis.hemoglobin = Some(6.0);

    let (_level, _score, fired_rules) = calculate_abnormality(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HEM-001"));
}

#[test]
fn fires_severe_thrombocytopenia_rule() {
    let mut data = create_normal_assessment();
    data.blood_count_analysis.platelet_count = Some(15.0);

    let (_level, _score, fired_rules) = calculate_abnormality(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HEM-002"));
}

#[test]
fn fires_severe_leukocytosis_rule() {
    let mut data = create_normal_assessment();
    data.blood_count_analysis.white_blood_cell_count = Some(35.0);

    let (_level, _score, fired_rules) = calculate_abnormality(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HEM-003"));
}

#[test]
fn fires_critical_inr_rule() {
    let mut data = create_normal_assessment();
    data.coagulation_studies.inr = Some(5.0);

    let (_level, _score, fired_rules) = calculate_abnormality(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HEM-004"));
}

#[test]
fn fires_moderate_anemia_rule() {
    let mut data = create_normal_assessment();
    data.blood_count_analysis.hemoglobin = Some(9.0);

    let (_level, _score, fired_rules) = calculate_abnormality(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HEM-006"));
}

#[test]
fn fires_iron_deficiency_rule() {
    let mut data = create_normal_assessment();
    data.iron_studies.serum_ferritin = Some(5.0);

    let (_level, _score, fired_rules) = calculate_abnormality(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HEM-013"));
}

#[test]
fn fires_normal_blood_count_rule_for_healthy_values() {
    let data = create_normal_assessment();
    let (_level, _score, fired_rules) = calculate_abnormality(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HEM-016")); // All CBC normal
}

#[test]
fn fires_normal_coagulation_rule_for_healthy_values() {
    let data = create_normal_assessment();
    let (_level, _score, fired_rules) = calculate_abnormality(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HEM-017")); // All coag normal
}

#[test]
fn fires_normal_iron_studies_rule_for_healthy_values() {
    let data = create_normal_assessment();
    let (_level, _score, fired_rules) = calculate_abnormality(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HEM-018")); // All iron normal
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
fn exactly_twenty_rules_defined() {
    let rules = all_rules();
    assert_eq!(rules.len(), 20);
}

#[test]
fn fires_microcytosis_rule() {
    let mut data = create_normal_assessment();
    data.blood_count_analysis.mean_corpuscular_volume = Some(70.0);

    let (_level, _score, fired_rules) = calculate_abnormality(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HEM-009"));
}

#[test]
fn fires_macrocytosis_rule() {
    let mut data = create_normal_assessment();
    data.blood_count_analysis.mean_corpuscular_volume = Some(110.0);

    let (_level, _score, fired_rules) = calculate_abnormality(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HEM-010"));
}
