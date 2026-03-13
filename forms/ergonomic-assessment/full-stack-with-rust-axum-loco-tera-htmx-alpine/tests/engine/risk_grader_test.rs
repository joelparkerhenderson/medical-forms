use ergonomic_assessment_tera_crate::engine::risk_grader::calculate_risk;
use ergonomic_assessment_tera_crate::engine::risk_rules::all_rules;
use ergonomic_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_low_risk_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1990-05-15".to_string();
    data.patient_information.assessment_date = "2026-03-09".to_string();
    data.patient_information.assessor_name = "Dr Johnson".to_string();
    data.patient_information.referral_reason = "Annual ergonomic review".to_string();

    // Occupation Details (non-scored)
    data.occupation_details.job_title = "Software Developer".to_string();
    data.occupation_details.department = "IT Services".to_string();
    data.occupation_details.employer = "Acme Corp".to_string();
    data.occupation_details.hours_per_week = "37to40".to_string();
    data.occupation_details.shift_pattern = "dayShift".to_string();
    data.occupation_details.years_in_role = "3to5".to_string();

    // Workstation Assessment — all 4s (Good)
    data.workstation_assessment.desk_height_appropriate = Some(4);
    data.workstation_assessment.chair_adjustability = Some(4);
    data.workstation_assessment.monitor_position = Some(4);
    data.workstation_assessment.keyboard_mouse_placement = Some(4);
    data.workstation_assessment.legroom_adequate = Some(4);
    data.workstation_assessment.desk_surface_area = Some(4);

    // Posture Assessment — all 4s (Good posture)
    data.posture_assessment.neck_posture = Some(4);
    data.posture_assessment.shoulder_posture = Some(4);
    data.posture_assessment.upper_back_posture = Some(4);
    data.posture_assessment.lower_back_posture = Some(4);
    data.posture_assessment.wrist_posture = Some(4);
    data.posture_assessment.leg_posture = Some(4);
    data.posture_assessment.rula_score = Some(3);
    data.posture_assessment.reba_score = Some(3);

    // Musculoskeletal Symptoms — all 1s (No pain)
    data.musculoskeletal_symptoms.neck_pain = Some(1);
    data.musculoskeletal_symptoms.shoulder_pain = Some(1);
    data.musculoskeletal_symptoms.upper_back_pain = Some(1);
    data.musculoskeletal_symptoms.lower_back_pain = Some(1);
    data.musculoskeletal_symptoms.wrist_hand_pain = Some(1);
    data.musculoskeletal_symptoms.elbow_pain = Some(1);
    data.musculoskeletal_symptoms.hip_pain = Some(1);
    data.musculoskeletal_symptoms.knee_pain = Some(1);
    data.musculoskeletal_symptoms.symptom_duration = "lessThan1Week".to_string();
    data.musculoskeletal_symptoms.symptom_frequency = "rarely".to_string();

    // Manual Handling (non-scored)
    data.manual_handling.lifting_required = "no".to_string();
    data.manual_handling.manual_handling_training = "yes".to_string();
    data.manual_handling.mechanical_aids_available = "yes".to_string();

    // DSE Assessment — all yes
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

    // Break Patterns — good
    data.break_patterns.break_frequency = "everyHour".to_string();
    data.break_patterns.break_duration_minutes = "5to10".to_string();
    data.break_patterns.micro_breaks_taken = "yes".to_string();
    data.break_patterns.stretching_exercises = "yes".to_string();
    data.break_patterns.task_variety = Some(4);
    data.break_patterns.autonomy_over_breaks = Some(4);

    // Environmental Factors — all 4s (Good)
    data.environmental_factors.lighting_adequate = Some(4);
    data.environmental_factors.temperature_comfortable = Some(4);
    data.environmental_factors.noise_level_acceptable = Some(4);
    data.environmental_factors.ventilation_adequate = Some(4);
    data.environmental_factors.space_sufficient = Some(4);
    data.environmental_factors.floor_surface_safe = Some(4);

    // Clinical Review
    data.clinical_review.previous_msd_history = "no".to_string();
    data.clinical_review.occupational_health_referral = "no".to_string();
    data.clinical_review.recommended_adjustments = "none".to_string();
    data.clinical_review.follow_up_required = "no".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_risk(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_low_risk_for_good_workstation() {
    let data = create_low_risk_assessment();
    let (level, score, _fired_rules) = calculate_risk(&data);
    assert_eq!(level, "low");
    // Quality items (20): all 4 -> risk = (5-4)/4*100 = 25% each -> sum = 500
    // Symptom items (8): all 1 -> risk = (1-1)/4*100 = 0% each -> sum = 0
    // Total = 500/28 = 17.857 -> rounds to 18
    assert_eq!(score, 18.0);
}

#[test]
fn returns_very_high_for_all_worst() {
    let mut data = create_low_risk_assessment();
    // Set all quality items to 1 (worst quality)
    data.workstation_assessment.desk_height_appropriate = Some(1);
    data.workstation_assessment.chair_adjustability = Some(1);
    data.workstation_assessment.monitor_position = Some(1);
    data.workstation_assessment.keyboard_mouse_placement = Some(1);
    data.workstation_assessment.legroom_adequate = Some(1);
    data.workstation_assessment.desk_surface_area = Some(1);
    data.posture_assessment.neck_posture = Some(1);
    data.posture_assessment.shoulder_posture = Some(1);
    data.posture_assessment.upper_back_posture = Some(1);
    data.posture_assessment.lower_back_posture = Some(1);
    data.posture_assessment.wrist_posture = Some(1);
    data.posture_assessment.leg_posture = Some(1);
    data.break_patterns.task_variety = Some(1);
    data.break_patterns.autonomy_over_breaks = Some(1);
    data.environmental_factors.lighting_adequate = Some(1);
    data.environmental_factors.temperature_comfortable = Some(1);
    data.environmental_factors.noise_level_acceptable = Some(1);
    data.environmental_factors.ventilation_adequate = Some(1);
    data.environmental_factors.space_sufficient = Some(1);
    data.environmental_factors.floor_surface_safe = Some(1);
    // Set all symptom items to 5 (worst symptoms)
    data.musculoskeletal_symptoms.neck_pain = Some(5);
    data.musculoskeletal_symptoms.shoulder_pain = Some(5);
    data.musculoskeletal_symptoms.upper_back_pain = Some(5);
    data.musculoskeletal_symptoms.lower_back_pain = Some(5);
    data.musculoskeletal_symptoms.wrist_hand_pain = Some(5);
    data.musculoskeletal_symptoms.elbow_pain = Some(5);
    data.musculoskeletal_symptoms.hip_pain = Some(5);
    data.musculoskeletal_symptoms.knee_pain = Some(5);

    let (level, score, fired_rules) = calculate_risk(&data);
    assert_eq!(level, "veryHigh");
    assert_eq!(score, 100.0);
    assert!(fired_rules.len() >= 5); // Multiple high concern rules should fire
}

#[test]
fn returns_low_for_all_best() {
    let mut data = create_low_risk_assessment();
    // Set all quality items to 5 (best)
    data.workstation_assessment.desk_height_appropriate = Some(5);
    data.workstation_assessment.chair_adjustability = Some(5);
    data.workstation_assessment.monitor_position = Some(5);
    data.workstation_assessment.keyboard_mouse_placement = Some(5);
    data.workstation_assessment.legroom_adequate = Some(5);
    data.workstation_assessment.desk_surface_area = Some(5);
    data.posture_assessment.neck_posture = Some(5);
    data.posture_assessment.shoulder_posture = Some(5);
    data.posture_assessment.upper_back_posture = Some(5);
    data.posture_assessment.lower_back_posture = Some(5);
    data.posture_assessment.wrist_posture = Some(5);
    data.posture_assessment.leg_posture = Some(5);
    data.break_patterns.task_variety = Some(5);
    data.break_patterns.autonomy_over_breaks = Some(5);
    data.environmental_factors.lighting_adequate = Some(5);
    data.environmental_factors.temperature_comfortable = Some(5);
    data.environmental_factors.noise_level_acceptable = Some(5);
    data.environmental_factors.ventilation_adequate = Some(5);
    data.environmental_factors.space_sufficient = Some(5);
    data.environmental_factors.floor_surface_safe = Some(5);
    // Set all symptom items to 1 (no pain)
    data.musculoskeletal_symptoms.neck_pain = Some(1);
    data.musculoskeletal_symptoms.shoulder_pain = Some(1);
    data.musculoskeletal_symptoms.upper_back_pain = Some(1);
    data.musculoskeletal_symptoms.lower_back_pain = Some(1);
    data.musculoskeletal_symptoms.wrist_hand_pain = Some(1);
    data.musculoskeletal_symptoms.elbow_pain = Some(1);
    data.musculoskeletal_symptoms.hip_pain = Some(1);
    data.musculoskeletal_symptoms.knee_pain = Some(1);

    let (level, score, _fired_rules) = calculate_risk(&data);
    assert_eq!(level, "low");
    assert_eq!(score, 0.0);
}

#[test]
fn returns_moderate_for_all_threes() {
    let mut data = create_low_risk_assessment();
    // Set all items to 3
    data.workstation_assessment.desk_height_appropriate = Some(3);
    data.workstation_assessment.chair_adjustability = Some(3);
    data.workstation_assessment.monitor_position = Some(3);
    data.workstation_assessment.keyboard_mouse_placement = Some(3);
    data.workstation_assessment.legroom_adequate = Some(3);
    data.workstation_assessment.desk_surface_area = Some(3);
    data.posture_assessment.neck_posture = Some(3);
    data.posture_assessment.shoulder_posture = Some(3);
    data.posture_assessment.upper_back_posture = Some(3);
    data.posture_assessment.lower_back_posture = Some(3);
    data.posture_assessment.wrist_posture = Some(3);
    data.posture_assessment.leg_posture = Some(3);
    data.musculoskeletal_symptoms.neck_pain = Some(3);
    data.musculoskeletal_symptoms.shoulder_pain = Some(3);
    data.musculoskeletal_symptoms.upper_back_pain = Some(3);
    data.musculoskeletal_symptoms.lower_back_pain = Some(3);
    data.musculoskeletal_symptoms.wrist_hand_pain = Some(3);
    data.musculoskeletal_symptoms.elbow_pain = Some(3);
    data.musculoskeletal_symptoms.hip_pain = Some(3);
    data.musculoskeletal_symptoms.knee_pain = Some(3);
    data.break_patterns.task_variety = Some(3);
    data.break_patterns.autonomy_over_breaks = Some(3);
    data.environmental_factors.lighting_adequate = Some(3);
    data.environmental_factors.temperature_comfortable = Some(3);
    data.environmental_factors.noise_level_acceptable = Some(3);
    data.environmental_factors.ventilation_adequate = Some(3);
    data.environmental_factors.space_sufficient = Some(3);
    data.environmental_factors.floor_surface_safe = Some(3);

    let (level, score, _fired_rules) = calculate_risk(&data);
    assert_eq!(level, "moderate");
    // Quality items (20): (5-3)/4*100 = 50% each -> 20*50 = 1000
    // Symptom items (8): (3-1)/4*100 = 50% each -> 8*50 = 400
    // Total = 1400/28 = 50 -> moderate (26-50)
    assert_eq!(score, 50.0);
}

#[test]
fn fires_severe_msd_rule() {
    let mut data = create_low_risk_assessment();
    data.musculoskeletal_symptoms.lower_back_pain = Some(5);

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ERGO-001"));
}

#[test]
fn fires_high_rula_score_rule() {
    let mut data = create_low_risk_assessment();
    data.posture_assessment.rula_score = Some(7);

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ERGO-002"));
}

#[test]
fn fires_heavy_manual_handling_rule() {
    let mut data = create_low_risk_assessment();
    data.manual_handling.max_lift_weight_kg = "moreThan25".to_string();

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ERGO-003"));
}

#[test]
fn fires_continuous_dse_rule() {
    let mut data = create_low_risk_assessment();
    data.dse_assessment.continuous_dse_hours = "moreThan8".to_string();

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ERGO-004"));
}

#[test]
fn fires_multiple_pain_sites_rule() {
    let mut data = create_low_risk_assessment();
    data.musculoskeletal_symptoms.neck_pain = Some(4);
    data.musculoskeletal_symptoms.shoulder_pain = Some(3);
    data.musculoskeletal_symptoms.lower_back_pain = Some(4);
    data.musculoskeletal_symptoms.wrist_hand_pain = Some(3);

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ERGO-005"));
}

#[test]
fn fires_positive_workstation_rule_for_excellent_setup() {
    let mut data = create_low_risk_assessment();
    data.workstation_assessment.desk_height_appropriate = Some(5);
    data.workstation_assessment.chair_adjustability = Some(5);
    data.workstation_assessment.monitor_position = Some(5);
    data.workstation_assessment.keyboard_mouse_placement = Some(5);
    data.workstation_assessment.legroom_adequate = Some(5);
    data.workstation_assessment.desk_surface_area = Some(5);

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ERGO-016"));
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
