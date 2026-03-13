use neurology_assessment_tera_crate::engine::neurology_grader::calculate_severity;
use neurology_assessment_tera_crate::engine::neurology_rules::all_rules;
use neurology_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_normal_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.full_name = "John Smith".to_string();
    data.patient_information.date_of_birth = "1980-05-15".to_string();
    data.patient_information.nhs_number = "123 456 7890".to_string();
    data.patient_information.gp_name = "Dr Jones".to_string();
    data.patient_information.gp_practice = "Riverside Medical Centre".to_string();

    // Neurological History
    data.neurological_history.primary_complaint = "Mild headache".to_string();
    data.neurological_history.symptom_duration = "weeks".to_string();
    data.neurological_history.symptom_onset = "gradual".to_string();
    data.neurological_history.seizure_history = "no".to_string();
    data.neurological_history.stroke_history = "no".to_string();
    data.neurological_history.head_injury = "no".to_string();

    // Headache Assessment
    data.headache_assessment.headache_type = "tension".to_string();
    data.headache_assessment.headache_severity = Some(3);
    data.headache_assessment.aura_present = "no".to_string();
    data.headache_assessment.red_flag_symptoms = "no".to_string();
    data.headache_assessment.thunderclap_onset = "no".to_string();

    // Cranial Nerve Examination - all normal
    data.cranial_nerve_examination.visual_fields = "normal".to_string();
    data.cranial_nerve_examination.pupil_reaction = "normal".to_string();
    data.cranial_nerve_examination.eye_movements = "normal".to_string();
    data.cranial_nerve_examination.facial_symmetry = "normal".to_string();

    // Motor Assessment - all 5/5
    data.motor_assessment.upper_limb_power_right = Some(5);
    data.motor_assessment.upper_limb_power_left = Some(5);
    data.motor_assessment.lower_limb_power_right = Some(5);
    data.motor_assessment.lower_limb_power_left = Some(5);
    data.motor_assessment.tonus_abnormality = "normal".to_string();
    data.motor_assessment.muscle_wasting = "no".to_string();
    data.motor_assessment.gait_assessment = "normal".to_string();

    // Sensory Assessment
    data.sensory_assessment.light_touch = "normal".to_string();
    data.sensory_assessment.peripheral_neuropathy = "no".to_string();
    data.sensory_assessment.dermatomal_pattern = "no".to_string();
    data.sensory_assessment.sensory_level = "none".to_string();

    // Reflexes & Coordination
    data.reflexes_coordination.biceps_reflex = "normal".to_string();
    data.reflexes_coordination.knee_reflex = "normal".to_string();
    data.reflexes_coordination.ankle_reflex = "normal".to_string();
    data.reflexes_coordination.plantar_response = "flexor".to_string();
    data.reflexes_coordination.finger_nose_test = "normal".to_string();
    data.reflexes_coordination.heel_shin_test = "normal".to_string();
    data.reflexes_coordination.romberg_sign = "negative".to_string();
    data.reflexes_coordination.dysdiadochokinesis = "no".to_string();

    // Cognitive Screening - normal
    data.cognitive_screening.orientation = Some(10);
    data.cognitive_screening.attention = Some(5);
    data.cognitive_screening.memory = Some(5);
    data.cognitive_screening.language = Some(5);
    data.cognitive_screening.executive_function = Some(5);
    data.cognitive_screening.mmse_score = Some(30);
    data.cognitive_screening.moca_score = Some(28);
    data.cognitive_screening.consciousness_level = "alert".to_string();

    // Clinical Review
    data.clinical_review.clinician_name = "Dr Smith".to_string();
    data.clinical_review.review_date = "2026-03-09".to_string();
    data.clinical_review.primary_diagnosis = "Tension headache".to_string();
    data.clinical_review.severity_level = "normal".to_string();
    data.clinical_review.urgency = "routine".to_string();
    data.clinical_review.referral_needed = "no".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_normal_for_normal_examination() {
    let data = create_normal_assessment();
    let (level, _score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "normal");
}

#[test]
fn returns_severe_for_multiple_high_concern_findings() {
    let mut data = create_normal_assessment();
    // Thunderclap headache + reduced consciousness = 2 high concern rules
    data.headache_assessment.thunderclap_onset = "yes".to_string();
    data.cognitive_screening.consciousness_level = "comatose".to_string();
    data.motor_assessment.upper_limb_power_right = Some(1);
    data.motor_assessment.lower_limb_power_left = Some(0);

    let (level, _score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "severe");
    let high_count = fired_rules.iter().filter(|r| r.concern_level == "high").count();
    assert!(high_count >= 2);
}

#[test]
fn returns_moderate_for_single_high_concern() {
    let mut data = create_normal_assessment();
    // Extensor plantar only
    data.reflexes_coordination.plantar_response = "extensor".to_string();

    let (level, _score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "moderate");
    assert!(fired_rules.iter().any(|r| r.id == "NEURO-004"));
}

#[test]
fn fires_thunderclap_rule() {
    let mut data = create_normal_assessment();
    data.headache_assessment.thunderclap_onset = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "NEURO-001"));
}

#[test]
fn fires_focal_deficit_rule_for_asymmetric_power() {
    let mut data = create_normal_assessment();
    data.motor_assessment.upper_limb_power_right = Some(5);
    data.motor_assessment.upper_limb_power_left = Some(2);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "NEURO-002"));
}

#[test]
fn fires_reduced_consciousness_rule() {
    let mut data = create_normal_assessment();
    data.cognitive_screening.consciousness_level = "stuporous".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "NEURO-003"));
}

#[test]
fn fires_migraine_with_aura_rule() {
    let mut data = create_normal_assessment();
    data.headache_assessment.headache_type = "migraine".to_string();
    data.headache_assessment.aura_present = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "NEURO-006"));
}

#[test]
fn fires_motor_weakness_rule() {
    let mut data = create_normal_assessment();
    data.motor_assessment.lower_limb_power_right = Some(3);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "NEURO-007"));
}

#[test]
fn fires_cognitive_impairment_rule() {
    let mut data = create_normal_assessment();
    data.cognitive_screening.mmse_score = Some(20);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "NEURO-011"));
}

#[test]
fn fires_peripheral_neuropathy_rule() {
    let mut data = create_normal_assessment();
    data.sensory_assessment.peripheral_neuropathy = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "NEURO-013"));
}

#[test]
fn fires_clonus_rule() {
    let mut data = create_normal_assessment();
    data.reflexes_coordination.ankle_reflex = "clonusPresent".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "NEURO-014"));
}

#[test]
fn fires_normal_examination_rule() {
    let data = create_normal_assessment();
    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "NEURO-016"));
}

#[test]
fn fires_tension_headache_rule() {
    let data = create_normal_assessment();
    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "NEURO-017"));
}

#[test]
fn fires_normal_cognitive_rule() {
    let data = create_normal_assessment();
    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "NEURO-020"));
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

#[test]
fn fires_rapidly_progressive_rule() {
    let mut data = create_normal_assessment();
    data.neurological_history.symptom_onset = "sudden".to_string();
    data.neurological_history.symptom_duration = "hours".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "NEURO-005"));
}
