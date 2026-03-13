use ergonomic_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use ergonomic_assessment_tera_crate::engine::types::*;

fn create_low_risk_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.assessment_date = "2026-03-09".to_string();
    data.occupation_details.job_title = "Software Developer".to_string();

    data.workstation_assessment.desk_height_appropriate = Some(4);
    data.workstation_assessment.chair_adjustability = Some(4);
    data.workstation_assessment.monitor_position = Some(4);
    data.workstation_assessment.keyboard_mouse_placement = Some(4);
    data.workstation_assessment.legroom_adequate = Some(4);
    data.workstation_assessment.desk_surface_area = Some(4);

    data.posture_assessment.neck_posture = Some(4);
    data.posture_assessment.shoulder_posture = Some(4);
    data.posture_assessment.upper_back_posture = Some(4);
    data.posture_assessment.lower_back_posture = Some(4);
    data.posture_assessment.wrist_posture = Some(4);
    data.posture_assessment.leg_posture = Some(4);
    data.posture_assessment.rula_score = Some(3);
    data.posture_assessment.reba_score = Some(3);

    data.musculoskeletal_symptoms.neck_pain = Some(1);
    data.musculoskeletal_symptoms.shoulder_pain = Some(1);
    data.musculoskeletal_symptoms.upper_back_pain = Some(1);
    data.musculoskeletal_symptoms.lower_back_pain = Some(1);
    data.musculoskeletal_symptoms.wrist_hand_pain = Some(1);
    data.musculoskeletal_symptoms.elbow_pain = Some(1);
    data.musculoskeletal_symptoms.hip_pain = Some(1);
    data.musculoskeletal_symptoms.knee_pain = Some(1);
    data.musculoskeletal_symptoms.symptom_frequency = "rarely".to_string();

    data.manual_handling.lifting_required = "no".to_string();
    data.manual_handling.manual_handling_training = "yes".to_string();
    data.manual_handling.mechanical_aids_available = "yes".to_string();

    data.dse_assessment.screen_flicker_free = "yes".to_string();
    data.dse_assessment.screen_brightness_adjustable = "yes".to_string();
    data.dse_assessment.screen_glare_free = "yes".to_string();
    data.dse_assessment.keyboard_separate = "yes".to_string();
    data.dse_assessment.keyboard_tiltable = "yes".to_string();
    data.dse_assessment.mouse_comfortable = "yes".to_string();
    data.dse_assessment.software_suitable = "yes".to_string();
    data.dse_assessment.continuous_dse_hours = "4to6".to_string();
    data.dse_assessment.eye_test_offered = "yes".to_string();
    data.dse_assessment.dse_training_completed = "yes".to_string();

    data.break_patterns.break_frequency = "everyHour".to_string();
    data.break_patterns.micro_breaks_taken = "yes".to_string();
    data.break_patterns.stretching_exercises = "yes".to_string();
    data.break_patterns.task_variety = Some(4);
    data.break_patterns.autonomy_over_breaks = Some(4);

    data.environmental_factors.lighting_adequate = Some(4);
    data.environmental_factors.temperature_comfortable = Some(4);
    data.environmental_factors.noise_level_acceptable = Some(4);
    data.environmental_factors.ventilation_adequate = Some(4);
    data.environmental_factors.space_sufficient = Some(4);
    data.environmental_factors.floor_surface_safe = Some(4);

    data.clinical_review.previous_msd_history = "no".to_string();
    data.clinical_review.occupational_health_referral = "no".to_string();
    data.clinical_review.recommended_adjustments = "none".to_string();
    data.clinical_review.follow_up_required = "no".to_string();

    data
}

#[test]
fn no_flags_for_low_risk_patient() {
    let data = create_low_risk_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_occupational_health_referral() {
    let mut data = create_low_risk_assessment();
    data.clinical_review.occupational_health_referral = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-OHREF-001"));
}

#[test]
fn flags_manual_handling_training_needed() {
    let mut data = create_low_risk_assessment();
    data.manual_handling.lifting_required = "yes".to_string();
    data.manual_handling.manual_handling_training = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MH-001"));
}

#[test]
fn flags_dse_non_compliance() {
    let mut data = create_low_risk_assessment();
    data.dse_assessment.dse_training_completed = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-DSE-001"));
}

#[test]
fn flags_repetitive_strain() {
    let mut data = create_low_risk_assessment();
    data.musculoskeletal_symptoms.wrist_hand_pain = Some(4);
    data.musculoskeletal_symptoms.symptom_frequency = "daily".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RSI-001"));
}

#[test]
fn flags_lower_back_pain() {
    let mut data = create_low_risk_assessment();
    data.musculoskeletal_symptoms.lower_back_pain = Some(4);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BACK-001"));
}

#[test]
fn flags_neck_pain() {
    let mut data = create_low_risk_assessment();
    data.musculoskeletal_symptoms.neck_pain = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-NECK-001"));
}

#[test]
fn flags_previous_msd_history() {
    let mut data = create_low_risk_assessment();
    data.clinical_review.previous_msd_history = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-HIST-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_low_risk_assessment();
    // Create flags of different priorities
    data.dse_assessment.dse_training_completed = "no".to_string(); // high
    data.musculoskeletal_symptoms.lower_back_pain = Some(4); // medium
    data.clinical_review.previous_msd_history = "yes".to_string(); // low

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
