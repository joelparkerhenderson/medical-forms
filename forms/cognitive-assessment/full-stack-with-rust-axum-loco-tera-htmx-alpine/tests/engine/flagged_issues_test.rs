use cognitive_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use cognitive_assessment_tera_crate::engine::types::*;

fn create_normal_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "John Smith".to_string();
    data.patient_information.date_of_birth = "1954-03-15".to_string();
    data.patient_information.patient_age = "72".to_string();

    data.cognitive_history.rate_of_decline = "stable".to_string();

    // Orientation - all correct
    data.orientation.orientation_year = Some(1);
    data.orientation.orientation_season = Some(1);
    data.orientation.orientation_date = Some(1);
    data.orientation.orientation_day = Some(1);
    data.orientation.orientation_month = Some(1);
    data.orientation.orientation_country = Some(1);
    data.orientation.orientation_county = Some(1);
    data.orientation.orientation_city = Some(1);
    data.orientation.orientation_building = Some(1);
    data.orientation.orientation_floor = Some(1);

    // Registration & Attention - all correct
    data.registration_attention.registration_word1 = Some(1);
    data.registration_attention.registration_word2 = Some(1);
    data.registration_attention.registration_word3 = Some(1);
    data.registration_attention.serial_sevens_1 = Some(1);
    data.registration_attention.serial_sevens_2 = Some(1);
    data.registration_attention.serial_sevens_3 = Some(1);
    data.registration_attention.serial_sevens_4 = Some(1);
    data.registration_attention.serial_sevens_5 = Some(1);

    // Recall - all correct
    data.recall.recall_word1 = Some(1);
    data.recall.recall_word2 = Some(1);
    data.recall.recall_word3 = Some(1);

    // Language - all correct
    data.language.naming_pencil = Some(1);
    data.language.naming_watch = Some(1);
    data.language.repetition = Some(1);
    data.language.three_stage_command = Some(1);
    data.language.reading_command = Some(1);
    data.language.writing_sentence = Some(1);

    // Visuospatial - all correct
    data.visuospatial.copy_pentagons = Some(1);
    data.visuospatial.clock_drawing_contour = Some(1);
    data.visuospatial.clock_drawing_numbers = Some(1);
    data.visuospatial.clock_drawing_hands = Some(1);
    data.visuospatial.cube_copy = Some(1);
    data.visuospatial.trail_making = Some(1);

    // Executive - all correct
    data.executive_function.verbal_fluency_score = Some(1);
    data.executive_function.abstraction_1 = Some(1);
    data.executive_function.abstraction_2 = Some(1);
    data.executive_function.digit_span_forward = Some(1);
    data.executive_function.digit_span_backward = Some(1);
    data.executive_function.inhibition_task = Some(1);

    // Functional - all independent
    data.functional_assessment.medication_management = Some(1);
    data.functional_assessment.financial_management = Some(1);
    data.functional_assessment.meal_preparation = Some(1);
    data.functional_assessment.transport_ability = Some(1);
    data.functional_assessment.housekeeping = Some(1);
    data.functional_assessment.personal_hygiene = Some(1);
    data.functional_assessment.safety_awareness = Some(1);

    data
}

#[test]
fn no_flags_for_normal_patient() {
    let data = create_normal_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_safety_concern() {
    let mut data = create_normal_assessment();
    data.functional_assessment.safety_awareness = Some(0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SAFE-001"));
}

#[test]
fn flags_medication_management_concern() {
    let mut data = create_normal_assessment();
    data.functional_assessment.medication_management = Some(0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MED-001"));
}

#[test]
fn flags_rapid_decline() {
    let mut data = create_normal_assessment();
    data.cognitive_history.rate_of_decline = "rapid".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-DECLINE-001"));
}

#[test]
fn flags_wandering_risk() {
    let mut data = create_normal_assessment();
    data.orientation.orientation_building = Some(0);
    data.orientation.orientation_floor = Some(0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-WANDER-001"));
}

#[test]
fn flags_carer_strain_for_multiple_dependencies() {
    let mut data = create_normal_assessment();
    data.functional_assessment.medication_management = Some(0);
    data.functional_assessment.financial_management = Some(0);
    data.functional_assessment.meal_preparation = Some(0);
    data.functional_assessment.transport_ability = Some(0);
    data.functional_assessment.housekeeping = Some(0);
    data.functional_assessment.personal_hygiene = Some(0);
    data.functional_assessment.safety_awareness = Some(0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CARER-001"));
}

#[test]
fn flags_financial_vulnerability() {
    let mut data = create_normal_assessment();
    data.functional_assessment.financial_management = Some(0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-FINANCE-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_normal_assessment();
    // Create flags of different priorities
    data.functional_assessment.safety_awareness = Some(0); // high
    data.functional_assessment.housekeeping = Some(0); // low
    data.functional_assessment.financial_management = Some(0); // medium

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
