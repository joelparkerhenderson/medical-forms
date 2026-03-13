use neurology_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use neurology_assessment_tera_crate::engine::types::*;

fn create_normal_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.full_name = "John Smith".to_string();

    data.neurological_history.symptom_onset = "gradual".to_string();
    data.neurological_history.seizure_history = "no".to_string();
    data.neurological_history.stroke_history = "no".to_string();

    data.headache_assessment.headache_type = "tension".to_string();
    data.headache_assessment.red_flag_symptoms = "no".to_string();
    data.headache_assessment.thunderclap_onset = "no".to_string();

    data.cranial_nerve_examination.visual_fields = "normal".to_string();
    data.cranial_nerve_examination.pupil_reaction = "normal".to_string();
    data.cranial_nerve_examination.eye_movements = "normal".to_string();
    data.cranial_nerve_examination.facial_symmetry = "normal".to_string();

    data.motor_assessment.upper_limb_power_right = Some(5);
    data.motor_assessment.upper_limb_power_left = Some(5);
    data.motor_assessment.lower_limb_power_right = Some(5);
    data.motor_assessment.lower_limb_power_left = Some(5);
    data.motor_assessment.gait_assessment = "normal".to_string();

    data.sensory_assessment.sensory_level = "none".to_string();
    data.sensory_assessment.peripheral_neuropathy = "no".to_string();

    data.cognitive_screening.mmse_score = Some(28);
    data.cognitive_screening.consciousness_level = "alert".to_string();

    data.clinical_review.urgency = "routine".to_string();
    data.clinical_review.primary_diagnosis = "Tension headache".to_string();

    data
}

#[test]
fn no_flags_for_normal_assessment() {
    let data = create_normal_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_thunderclap_headache() {
    let mut data = create_normal_assessment();
    data.headache_assessment.thunderclap_onset = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SAH-001"));
}

#[test]
fn flags_reduced_consciousness() {
    let mut data = create_normal_assessment();
    data.cognitive_screening.consciousness_level = "drowsy".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CONS-001"));
}

#[test]
fn flags_new_seizure() {
    let mut data = create_normal_assessment();
    data.neurological_history.seizure_history = "yes".to_string();
    data.neurological_history.previous_neurological_condition = "".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SEIZURE-001"));
}

#[test]
fn flags_red_flag_headache() {
    let mut data = create_normal_assessment();
    data.headache_assessment.red_flag_symptoms = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-TUMOUR-001"));
}

#[test]
fn flags_significant_motor_weakness() {
    let mut data = create_normal_assessment();
    data.motor_assessment.upper_limb_power_left = Some(2);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MOTOR-001"));
}

#[test]
fn flags_abnormal_gait() {
    let mut data = create_normal_assessment();
    data.motor_assessment.gait_assessment = "abnormal".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-GAIT-001"));
}

#[test]
fn flags_cognitive_decline() {
    let mut data = create_normal_assessment();
    data.cognitive_screening.mmse_score = Some(18);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-COGN-001"));
}

#[test]
fn flags_stroke_pathway() {
    let mut data = create_normal_assessment();
    data.neurological_history.symptom_onset = "sudden".to_string();
    data.cranial_nerve_examination.facial_symmetry = "asymmetric".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-STROKE-001"));
}

#[test]
fn flags_urgent_investigation() {
    let mut data = create_normal_assessment();
    data.clinical_review.urgency = "emergency".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-INV-001"));
}

#[test]
fn flags_functional_disorder() {
    let mut data = create_normal_assessment();
    data.clinical_review.primary_diagnosis = "Functional neurological disorder".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-FUNC-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_normal_assessment();
    // Create flags of different priorities
    data.cognitive_screening.mmse_score = Some(18); // medium (FLAG-COGN-001)
    data.motor_assessment.gait_assessment = "abnormal".to_string(); // medium (FLAG-GAIT-001)
    data.headache_assessment.thunderclap_onset = "yes".to_string(); // high (FLAG-SAH-001)
    data.clinical_review.primary_diagnosis = "Functional disorder".to_string(); // low (FLAG-FUNC-001)

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
