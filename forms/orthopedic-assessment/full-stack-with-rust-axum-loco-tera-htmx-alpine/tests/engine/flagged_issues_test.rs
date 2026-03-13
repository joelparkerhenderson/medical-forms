use orthopedic_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use orthopedic_assessment_tera_crate::engine::types::*;

fn create_normal_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Doe".to_string();
    data.patient_information.assessment_date = "2026-03-10".to_string();
    data.patient_information.clinician_name = "Mr Jones".to_string();

    data.pain_assessment.pain_severity = Some(2);
    data.pain_assessment.pain_at_rest = Some(1);
    data.pain_assessment.pain_with_activity = Some(2);
    data.pain_assessment.night_pain = Some(1);
    data.pain_assessment.pain_radiating = "no".to_string();

    data.joint_examination.affected_joint = "knee".to_string();
    data.joint_examination.range_of_motion = Some(2);
    data.joint_examination.joint_stability = Some(1);
    data.joint_examination.joint_swelling = Some(1);
    data.joint_examination.joint_crepitus = "no".to_string();
    data.joint_examination.joint_deformity = "no".to_string();
    data.joint_examination.ligament_integrity = Some(1);

    data.muscle_assessment.muscle_strength = Some(2);
    data.muscle_assessment.muscle_atrophy = Some(1);
    data.muscle_assessment.muscle_tone = Some(1);
    data.muscle_assessment.grip_strength = Some(1);
    data.muscle_assessment.muscle_tenderness = Some(1);
    data.muscle_assessment.reflexes_normal = "yes".to_string();
    data.muscle_assessment.sensation_intact = "yes".to_string();

    data.spinal_assessment.spinal_alignment = Some(1);
    data.spinal_assessment.spinal_mobility = Some(1);
    data.spinal_assessment.disc_involvement = "no".to_string();
    data.spinal_assessment.nerve_root_signs = "no".to_string();
    data.spinal_assessment.straight_leg_raise = Some(1);
    data.spinal_assessment.neurological_deficit = "no".to_string();
    data.spinal_assessment.spinal_tenderness = Some(1);

    data.imaging_investigations.imaging_urgency = Some(1);
    data.imaging_investigations.further_imaging_needed = "no".to_string();

    data.functional_status.mobility_level = Some(2);
    data.functional_status.daily_activities = Some(1);
    data.functional_status.work_capacity = Some(1);
    data.functional_status.sleep_quality = Some(1);
    data.functional_status.fall_risk = Some(1);

    data.surgical_considerations.surgical_candidate = "no".to_string();
    data.surgical_considerations.surgical_urgency = Some(1);
    data.surgical_considerations.anaesthetic_risk = Some(1);
    data.surgical_considerations.conservative_options_exhausted = "no".to_string();
    data.surgical_considerations.expected_outcome = Some(1);

    data.clinical_review.overall_severity = Some(2);
    data.clinical_review.patient_understanding = Some(1);
    data.clinical_review.red_flag_symptoms = "no".to_string();

    data
}

#[test]
fn no_flags_for_normal_assessment() {
    let data = create_normal_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_severe_rest_pain() {
    let mut data = create_normal_assessment();
    data.pain_assessment.pain_at_rest = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PAIN-001"));
}

#[test]
fn flags_radiating_pain() {
    let mut data = create_normal_assessment();
    data.pain_assessment.pain_radiating = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PAIN-002"));
}

#[test]
fn flags_joint_instability() {
    let mut data = create_normal_assessment();
    data.joint_examination.joint_stability = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-JOINT-001"));
}

#[test]
fn flags_abnormal_reflexes() {
    let mut data = create_normal_assessment();
    data.muscle_assessment.reflexes_normal = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MUSCLE-002"));
}

#[test]
fn flags_high_fall_risk() {
    let mut data = create_normal_assessment();
    data.functional_status.fall_risk = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-FUNC-002"));
}

#[test]
fn flags_red_flag_symptoms() {
    let mut data = create_normal_assessment();
    data.clinical_review.red_flag_symptoms = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CLIN-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_normal_assessment();
    // Create flags of different priorities
    data.pain_assessment.pain_at_rest = Some(5); // high (FLAG-PAIN-001)
    data.joint_examination.joint_crepitus = "yes".to_string(); // low (FLAG-JOINT-002)
    data.pain_assessment.pain_radiating = "yes".to_string(); // medium (FLAG-PAIN-002)
    data.muscle_assessment.reflexes_normal = "no".to_string(); // high (FLAG-MUSCLE-002)

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
