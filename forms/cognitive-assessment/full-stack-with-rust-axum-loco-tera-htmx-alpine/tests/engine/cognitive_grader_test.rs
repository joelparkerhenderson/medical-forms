use cognitive_assessment_tera_crate::engine::cognitive_grader::calculate_cognitive_status;
use cognitive_assessment_tera_crate::engine::cognitive_rules::all_rules;
use cognitive_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_normal_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.patient_name = "John Smith".to_string();
    data.patient_information.date_of_birth = "1954-03-15".to_string();
    data.patient_information.patient_age = "72".to_string();
    data.patient_information.patient_sex = "male".to_string();
    data.patient_information.education_level = "university".to_string();
    data.patient_information.primary_language = "English".to_string();
    data.patient_information.handedness = "right".to_string();
    data.patient_information.assessment_date = "2026-03-09".to_string();

    // Cognitive History
    data.cognitive_history.reason_for_referral = "Routine screening".to_string();
    data.cognitive_history.onset_of_symptoms = "gradual".to_string();
    data.cognitive_history.symptom_duration = "lessThan6Months".to_string();
    data.cognitive_history.rate_of_decline = "stable".to_string();
    data.cognitive_history.family_history_dementia = "no".to_string();

    // Orientation - all correct (10/10)
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

    // Registration & Attention - all correct (8/8)
    data.registration_attention.registration_word1 = Some(1);
    data.registration_attention.registration_word2 = Some(1);
    data.registration_attention.registration_word3 = Some(1);
    data.registration_attention.serial_sevens_1 = Some(1);
    data.registration_attention.serial_sevens_2 = Some(1);
    data.registration_attention.serial_sevens_3 = Some(1);
    data.registration_attention.serial_sevens_4 = Some(1);
    data.registration_attention.serial_sevens_5 = Some(1);

    // Recall - all correct (3/3)
    data.recall.recall_word1 = Some(1);
    data.recall.recall_word2 = Some(1);
    data.recall.recall_word3 = Some(1);
    data.recall.recall_strategy = "spontaneous".to_string();

    // Language - all correct (8/8: naming 2, repetition 1, three-stage command 3, reading 1, writing 1)
    data.language.naming_pencil = Some(1);
    data.language.naming_watch = Some(1);
    data.language.repetition = Some(1);
    data.language.three_stage_command = Some(3);
    data.language.reading_command = Some(1);
    data.language.writing_sentence = Some(1);

    // Visuospatial - all correct
    data.visuospatial.copy_pentagons = Some(1);
    data.visuospatial.clock_drawing_contour = Some(1);
    data.visuospatial.clock_drawing_numbers = Some(1);
    data.visuospatial.clock_drawing_hands = Some(1);
    data.visuospatial.cube_copy = Some(1);
    data.visuospatial.trail_making = Some(1);

    // Executive Function - all correct
    data.executive_function.verbal_fluency_score = Some(1);
    data.executive_function.abstraction_1 = Some(1);
    data.executive_function.abstraction_2 = Some(1);
    data.executive_function.digit_span_forward = Some(1);
    data.executive_function.digit_span_backward = Some(1);
    data.executive_function.inhibition_task = Some(1);

    // Functional Assessment - all independent
    data.functional_assessment.medication_management = Some(1);
    data.functional_assessment.financial_management = Some(1);
    data.functional_assessment.meal_preparation = Some(1);
    data.functional_assessment.transport_ability = Some(1);
    data.functional_assessment.housekeeping = Some(1);
    data.functional_assessment.personal_hygiene = Some(1);
    data.functional_assessment.safety_awareness = Some(1);

    // Clinical Review
    data.clinical_review.assessor_name = "Dr Jones".to_string();
    data.clinical_review.assessor_role = "consultant".to_string();
    data.clinical_review.assessment_environment = "clinic".to_string();
    data.clinical_review.patient_cooperation = "excellent".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, mmse, moca, fired_rules) = calculate_cognitive_status(&data);
    assert_eq!(level, "draft");
    assert_eq!(mmse, 0);
    assert_eq!(moca, 0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_normal_for_perfect_scores() {
    let data = create_normal_assessment();
    let (level, mmse, _moca, _fired_rules) = calculate_cognitive_status(&data);
    assert_eq!(level, "normal");
    assert_eq!(mmse, 30); // All 30 MMSE items correct
}

#[test]
fn returns_severe_impairment_for_all_zeros() {
    let mut data = create_normal_assessment();
    // Set all scored items to 0
    data.orientation.orientation_year = Some(0);
    data.orientation.orientation_season = Some(0);
    data.orientation.orientation_date = Some(0);
    data.orientation.orientation_day = Some(0);
    data.orientation.orientation_month = Some(0);
    data.orientation.orientation_country = Some(0);
    data.orientation.orientation_county = Some(0);
    data.orientation.orientation_city = Some(0);
    data.orientation.orientation_building = Some(0);
    data.orientation.orientation_floor = Some(0);
    data.registration_attention.registration_word1 = Some(0);
    data.registration_attention.registration_word2 = Some(0);
    data.registration_attention.registration_word3 = Some(0);
    data.registration_attention.serial_sevens_1 = Some(0);
    data.registration_attention.serial_sevens_2 = Some(0);
    data.registration_attention.serial_sevens_3 = Some(0);
    data.registration_attention.serial_sevens_4 = Some(0);
    data.registration_attention.serial_sevens_5 = Some(0);
    data.recall.recall_word1 = Some(0);
    data.recall.recall_word2 = Some(0);
    data.recall.recall_word3 = Some(0);
    data.language.naming_pencil = Some(0);
    data.language.naming_watch = Some(0);
    data.language.repetition = Some(0);
    data.language.three_stage_command = Some(0);
    data.language.reading_command = Some(0);
    data.language.writing_sentence = Some(0);
    data.visuospatial.copy_pentagons = Some(0);

    let (level, mmse, _moca, fired_rules) = calculate_cognitive_status(&data);
    assert_eq!(level, "severeImpairment");
    assert_eq!(mmse, 0);
    assert!(fired_rules.len() >= 3); // Multiple high concern rules should fire
}

#[test]
fn returns_mild_impairment_for_score_of_21() {
    let mut data = create_normal_assessment();
    // Set orientation to mostly correct, but fail some items to get MMSE = 21
    // Full score = 30, need to lose 9 points
    // serial_sevens_2-5 = 0 (-4), recall_word1-3 = 0 (-3),
    // three_stage_command from 3 to 2 (-1), copy_pentagons = 0 (-1) = total -9
    data.registration_attention.serial_sevens_2 = Some(0);
    data.registration_attention.serial_sevens_3 = Some(0);
    data.registration_attention.serial_sevens_4 = Some(0);
    data.registration_attention.serial_sevens_5 = Some(0);
    data.recall.recall_word1 = Some(0);
    data.recall.recall_word2 = Some(0);
    data.recall.recall_word3 = Some(0);
    data.language.three_stage_command = Some(2);
    data.visuospatial.copy_pentagons = Some(0);

    let (level, mmse, _moca, _fired_rules) = calculate_cognitive_status(&data);
    assert_eq!(level, "mildImpairment");
    assert_eq!(mmse, 21);
}

#[test]
fn returns_moderate_impairment_for_score_of_15() {
    let mut data = create_normal_assessment();
    // Need MMSE = 15, fail 15 items out of 30
    data.orientation.orientation_season = Some(0);
    data.orientation.orientation_date = Some(0);
    data.orientation.orientation_day = Some(0);
    data.orientation.orientation_county = Some(0);
    data.orientation.orientation_floor = Some(0);
    data.registration_attention.registration_word2 = Some(0);
    data.registration_attention.registration_word3 = Some(0);
    data.registration_attention.serial_sevens_2 = Some(0);
    data.registration_attention.serial_sevens_3 = Some(0);
    data.registration_attention.serial_sevens_4 = Some(0);
    data.registration_attention.serial_sevens_5 = Some(0);
    data.recall.recall_word1 = Some(0);
    data.recall.recall_word2 = Some(0);
    data.recall.recall_word3 = Some(0);
    data.visuospatial.copy_pentagons = Some(0);

    let (level, mmse, _moca, _fired_rules) = calculate_cognitive_status(&data);
    assert_eq!(level, "moderateImpairment");
    assert_eq!(mmse, 15);
}

#[test]
fn fires_rapid_decline_rule() {
    let mut data = create_normal_assessment();
    data.cognitive_history.rate_of_decline = "rapid".to_string();

    let (_level, _mmse, _moca, fired_rules) = calculate_cognitive_status(&data);
    assert!(fired_rules.iter().any(|r| r.id == "COG-002"));
}

#[test]
fn fires_normal_cognition_rule_for_high_mmse() {
    let data = create_normal_assessment();
    let (_level, _mmse, _moca, fired_rules) = calculate_cognitive_status(&data);
    assert!(fired_rules.iter().any(|r| r.id == "COG-016"));
}

#[test]
fn fires_full_orientation_rule() {
    let data = create_normal_assessment();
    let (_level, _mmse, _moca, fired_rules) = calculate_cognitive_status(&data);
    assert!(fired_rules.iter().any(|r| r.id == "COG-017"));
}

#[test]
fn fires_full_recall_rule() {
    let data = create_normal_assessment();
    let (_level, _mmse, _moca, fired_rules) = calculate_cognitive_status(&data);
    assert!(fired_rules.iter().any(|r| r.id == "COG-018"));
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
