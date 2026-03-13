use mobility_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use mobility_assessment_tera_crate::engine::types::*;

fn create_minimal_assistance_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.assessment_date = "2026-03-01".to_string();
    data.patient_information.primary_diagnosis = "Hip fracture".to_string();
    data.patient_information.assessor_name = "Dr Johnson".to_string();

    data.mobility_history.pre_morbid_mobility = Some(4);
    data.mobility_history.current_mobility_level = Some(4);
    data.mobility_history.pain_with_movement = Some(4);
    data.mobility_history.endurance_level = Some(4);

    data.balance_assessment.static_sitting_balance = Some(4);
    data.balance_assessment.dynamic_sitting_balance = Some(4);
    data.balance_assessment.static_standing_balance = Some(4);
    data.balance_assessment.dynamic_standing_balance = Some(4);
    data.balance_assessment.single_leg_stance = Some(4);
    data.balance_assessment.tandem_stance = Some(4);

    data.gait_analysis.gait_pattern_quality = Some(4);
    data.gait_analysis.gait_speed = Some(4);
    data.gait_analysis.step_length_symmetry = Some(4);
    data.gait_analysis.turning_ability = Some(4);
    data.gait_analysis.outdoor_walking = Some(4);
    data.gait_analysis.walking_endurance = Some(4);

    data.transfers_bed_mobility.bed_mobility = Some(4);
    data.transfers_bed_mobility.sit_to_stand = Some(4);
    data.transfers_bed_mobility.stand_to_sit = Some(4);
    data.transfers_bed_mobility.chair_transfer = Some(4);
    data.transfers_bed_mobility.toilet_transfer = Some(4);
    data.transfers_bed_mobility.car_transfer = Some(4);

    data.stairs_obstacles.stair_ascent = Some(4);
    data.stairs_obstacles.stair_descent = Some(4);
    data.stairs_obstacles.curb_negotiation = Some(4);
    data.stairs_obstacles.uneven_surfaces = Some(4);
    data.stairs_obstacles.obstacle_avoidance = Some(4);
    data.stairs_obstacles.ramp_navigation = Some(4);

    data.upper_limb_function.reaching_overhead = Some(4);
    data.upper_limb_function.grip_strength = Some(4);
    data.upper_limb_function.fine_motor_control = Some(4);
    data.upper_limb_function.bilateral_coordination = Some(4);
    data.upper_limb_function.upper_limb_weight_bearing = Some(4);
    data.upper_limb_function.functional_reach = Some(4);

    data.assistive_devices.current_device_type = "walkingStick".to_string();
    data.assistive_devices.device_usage_competence = Some(4);
    data.assistive_devices.device_condition = Some(4);
    data.assistive_devices.wheelchair_skills = Some(4);

    data.falls_risk_assessment.falls_in_past_year = "none".to_string();
    data.falls_risk_assessment.fear_of_falling = Some(4);
    data.falls_risk_assessment.medication_fall_risk = Some(4);
    data.falls_risk_assessment.postural_hypotension = Some(4);
    data.falls_risk_assessment.vision_impairment = Some(4);
    data.falls_risk_assessment.cognitive_impact_on_mobility = Some(4);

    data.clinical_review.overall_mobility_rating = Some(4);
    data.clinical_review.rehabilitation_potential = Some(4);

    data
}

#[test]
fn no_flags_for_good_assessment() {
    let data = create_minimal_assistance_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_unable_to_stand() {
    let mut data = create_minimal_assistance_assessment();
    data.balance_assessment.static_standing_balance = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BAL-001"));
}

#[test]
fn flags_impaired_gait() {
    let mut data = create_minimal_assistance_assessment();
    data.gait_analysis.gait_pattern_quality = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-GAIT-001"));
}

#[test]
fn flags_unable_sit_to_stand() {
    let mut data = create_minimal_assistance_assessment();
    data.transfers_bed_mobility.sit_to_stand = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-TRANS-001"));
}

#[test]
fn flags_recurrent_faller() {
    let mut data = create_minimal_assistance_assessment();
    data.falls_risk_assessment.falls_in_past_year = "twoOrMore".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-FALLS-001"));
}

#[test]
fn flags_severe_pain() {
    let mut data = create_minimal_assistance_assessment();
    data.mobility_history.pain_with_movement = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PAIN-001"));
}

#[test]
fn flags_cognitive_impact() {
    let mut data = create_minimal_assistance_assessment();
    data.falls_risk_assessment.cognitive_impact_on_mobility = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-COG-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_minimal_assistance_assessment();
    // Create flags of different priorities
    data.balance_assessment.static_standing_balance = Some(1); // high: FLAG-BAL-001
    data.falls_risk_assessment.fear_of_falling = Some(2); // medium: FLAG-FALLS-002
    data.balance_assessment.dynamic_standing_balance = Some(2); // medium: FLAG-BAL-002
    data.falls_risk_assessment.vision_impairment = Some(2); // medium: FLAG-VISION-001

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
