use attention_deficit_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use attention_deficit_assessment_tera_crate::engine::types::*;

fn create_clean_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.assessment_date = "2026-03-09".to_string();

    data.developmental_history.childhood_symptoms_present = "yes".to_string();

    data.functional_impact.work_performance_impact = Some(1);
    data.functional_impact.academic_impact = Some(1);
    data.functional_impact.relationship_impact = Some(1);
    data.functional_impact.driving_safety_concern = Some(0);

    data.comorbidities.anxiety_symptoms = "no".to_string();
    data.comorbidities.depression_symptoms = "no".to_string();
    data.comorbidities.mood_disorder_history = "no".to_string();
    data.comorbidities.sleep_disorder = "no".to_string();
    data.comorbidities.substance_use_current = "no".to_string();
    data.comorbidities.substance_use_history = "no".to_string();
    data.comorbidities.autism_spectrum_traits = "no".to_string();

    data.current_management.cardiac_history = "no".to_string();
    data.current_management.family_cardiac_history = "no".to_string();
    data.current_management.blood_pressure_status = "normal".to_string();

    data.clinical_review.collateral_history_obtained = "yes".to_string();

    data
}

#[test]
fn no_flags_for_clean_assessment() {
    let data = create_clean_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_driving_safety_concern() {
    let mut data = create_clean_assessment();
    data.functional_impact.driving_safety_concern = Some(3);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-DRIVE-001"));
}

#[test]
fn flags_substance_misuse() {
    let mut data = create_clean_assessment();
    data.comorbidities.substance_use_current = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SUBST-001"));
}

#[test]
fn flags_mood_disorder() {
    let mut data = create_clean_assessment();
    data.comorbidities.mood_disorder_history = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MOOD-001"));
}

#[test]
fn flags_cardiac_history() {
    let mut data = create_clean_assessment();
    data.current_management.cardiac_history = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CARD-001"));
}

#[test]
fn flags_anxiety_comorbidity() {
    let mut data = create_clean_assessment();
    data.comorbidities.anxiety_symptoms = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ANX-001"));
}

#[test]
fn flags_sleep_disorder() {
    let mut data = create_clean_assessment();
    data.comorbidities.sleep_disorder = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SLEEP-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_clean_assessment();
    // Create flags of different priorities
    data.functional_impact.driving_safety_concern = Some(3); // high
    data.comorbidities.anxiety_symptoms = "yes".to_string(); // medium
    data.clinical_review.collateral_history_obtained = "no".to_string(); // low
    data.developmental_history.childhood_symptoms_present = "no".to_string(); // low

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
