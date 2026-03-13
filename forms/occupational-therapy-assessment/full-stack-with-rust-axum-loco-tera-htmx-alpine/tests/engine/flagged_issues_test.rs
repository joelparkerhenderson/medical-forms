use occupational_therapy_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use occupational_therapy_assessment_tera_crate::engine::types::*;

fn create_good_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.assessment_date = "2026-03-01".to_string();
    data.patient_information.diagnosis = "CVA".to_string();

    data.daily_living_activities.feeding = Some(4);
    data.daily_living_activities.bathing = Some(4);
    data.daily_living_activities.dressing_upper = Some(4);
    data.daily_living_activities.dressing_lower = Some(4);
    data.daily_living_activities.grooming = Some(4);
    data.daily_living_activities.toileting = Some(4);
    data.daily_living_activities.transfers = Some(4);
    data.daily_living_activities.mobility = Some(4);

    data.instrumental_activities.meal_preparation = Some(4);
    data.instrumental_activities.household_management = Some(4);
    data.instrumental_activities.medication_management = Some(4);
    data.instrumental_activities.financial_management = Some(4);
    data.instrumental_activities.community_mobility = Some(4);
    data.instrumental_activities.shopping = Some(4);
    data.instrumental_activities.telephone_use = Some(4);

    data.cognitive_perceptual.orientation = Some(4);
    data.cognitive_perceptual.attention = Some(4);
    data.cognitive_perceptual.memory = Some(4);
    data.cognitive_perceptual.problem_solving = Some(4);
    data.cognitive_perceptual.safety_awareness = Some(4);
    data.cognitive_perceptual.visual_perception = Some(4);
    data.cognitive_perceptual.sequencing = Some(4);

    data.motor_sensory.upper_extremity_strength = Some(4);
    data.motor_sensory.lower_extremity_strength = Some(4);
    data.motor_sensory.range_of_motion = Some(4);
    data.motor_sensory.fine_motor_coordination = Some(4);
    data.motor_sensory.gross_motor_coordination = Some(4);
    data.motor_sensory.balance = Some(4);
    data.motor_sensory.sensation = Some(4);
    data.motor_sensory.endurance = Some(4);

    data.home_environment.home_accessibility = Some(4);
    data.home_environment.bathroom_safety = Some(4);
    data.home_environment.kitchen_safety = Some(4);
    data.home_environment.fall_risk_factors = Some(4);

    data.work_leisure.return_to_work_potential = Some(4);
    data.work_leisure.leisure_participation = Some(4);
    data.work_leisure.social_participation = Some(4);
    data.work_leisure.community_integration = Some(4);

    data.goals_priorities.motivation_level = Some(4);

    data.clinical_review.pain_level = Some(2);
    data.clinical_review.fatigue_level = Some(2);
    data.clinical_review.emotional_status = Some(4);
    data.clinical_review.skin_integrity = Some(4);

    data
}

#[test]
fn no_flags_for_good_assessment() {
    let data = create_good_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_toileting_dependence() {
    let mut data = create_good_assessment();
    data.daily_living_activities.toileting = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ADL-001"));
}

#[test]
fn flags_medication_management_dependence() {
    let mut data = create_good_assessment();
    data.instrumental_activities.medication_management = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-IADL-001"));
}

#[test]
fn flags_orientation_impairment() {
    let mut data = create_good_assessment();
    data.cognitive_perceptual.orientation = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-COG-001"));
}

#[test]
fn flags_upper_extremity_weakness() {
    let mut data = create_good_assessment();
    data.motor_sensory.upper_extremity_strength = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MOT-001"));
}

#[test]
fn flags_bathroom_safety_concern() {
    let mut data = create_good_assessment();
    data.home_environment.bathroom_safety = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-HOME-001"));
}

#[test]
fn flags_severe_pain() {
    let mut data = create_good_assessment();
    data.clinical_review.pain_level = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CLIN-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_good_assessment();
    // Create flags of different priorities
    data.daily_living_activities.toileting = Some(1); // high (FLAG-ADL-001)
    data.motor_sensory.endurance = Some(2); // medium (FLAG-MOT-002)
    data.goals_priorities.motivation_level = Some(1); // medium (FLAG-GOAL-001)
    data.cognitive_perceptual.orientation = Some(1); // high (FLAG-COG-001)

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
