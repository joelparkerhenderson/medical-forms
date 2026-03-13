use hematology_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use hematology_assessment_tera_crate::engine::types::*;

fn create_normal_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.specimen_date = "2026-03-01".to_string();

    data.blood_count_analysis.hemoglobin = Some(14.0);
    data.blood_count_analysis.hematocrit = Some(42.0);
    data.blood_count_analysis.red_blood_cell_count = Some(4.8);
    data.blood_count_analysis.white_blood_cell_count = Some(7.0);
    data.blood_count_analysis.platelet_count = Some(250.0);
    data.blood_count_analysis.mean_corpuscular_volume = Some(88.0);
    data.blood_count_analysis.mean_corpuscular_hemoglobin = Some(29.0);
    data.blood_count_analysis.red_cell_distribution_width = Some(13.0);

    data.coagulation_studies.prothrombin_time = Some(12.0);
    data.coagulation_studies.inr = Some(1.0);
    data.coagulation_studies.activated_partial_thromboplastin_time = Some(30.0);
    data.coagulation_studies.fibrinogen = Some(300.0);
    data.coagulation_studies.d_dimer = Some(0.3);

    data.iron_studies.serum_iron = Some(100.0);
    data.iron_studies.serum_ferritin = Some(80.0);
    data.iron_studies.transferrin_saturation = Some(32.0);

    data.peripheral_blood_film.abnormal_cell_morphology = "none".to_string();
    data.hemoglobinopathy_screening.sickle_cell_screen = "negative".to_string();
    data.hemoglobinopathy_screening.thalassemia_screen = "negative".to_string();
    data.transfusion_history.transfusion_reactions = "none".to_string();
    data.clinical_review.urgency_level = Some(1);

    data
}

#[test]
fn no_flags_for_normal_patient() {
    let data = create_normal_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_pancytopenia() {
    let mut data = create_normal_assessment();
    data.blood_count_analysis.hemoglobin = Some(8.0);
    data.blood_count_analysis.white_blood_cell_count = Some(3.0);
    data.blood_count_analysis.platelet_count = Some(100.0);

    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CBC-001"));
}

#[test]
fn flags_severe_leukopenia() {
    let mut data = create_normal_assessment();
    data.blood_count_analysis.white_blood_cell_count = Some(0.5);

    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CBC-002"));
}

#[test]
fn flags_dic_pattern() {
    let mut data = create_normal_assessment();
    data.coagulation_studies.fibrinogen = Some(80.0);
    data.coagulation_studies.d_dimer = Some(3.0);

    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-COAG-001"));
}

#[test]
fn flags_prolonged_aptt() {
    let mut data = create_normal_assessment();
    data.coagulation_studies.activated_partial_thromboplastin_time = Some(70.0);

    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-COAG-002"));
}

#[test]
fn flags_iron_deficiency_pattern() {
    let mut data = create_normal_assessment();
    data.iron_studies.serum_ferritin = Some(5.0);
    data.iron_studies.transferrin_saturation = Some(10.0);

    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-IRON-001"));
}

#[test]
fn flags_positive_sickle_cell() {
    let mut data = create_normal_assessment();
    data.hemoglobinopathy_screening.sickle_cell_screen = "positive".to_string();

    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-HGB-001"));
}

#[test]
fn flags_transfusion_reaction_history() {
    let mut data = create_normal_assessment();
    data.transfusion_history.transfusion_reactions = "hemolytic".to_string();

    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-TRANS-001"));
}

#[test]
fn flags_high_urgency() {
    let mut data = create_normal_assessment();
    data.clinical_review.urgency_level = Some(5);

    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CLIN-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_normal_assessment();
    // Create flags of different priorities
    data.blood_count_analysis.white_blood_cell_count = Some(0.5); // high (FLAG-CBC-002)
    data.hemoglobinopathy_screening.sickle_cell_screen = "positive".to_string(); // medium (FLAG-HGB-001)
    data.peripheral_blood_film.abnormal_cell_morphology = "blasts".to_string(); // medium (FLAG-FILM-001)

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
