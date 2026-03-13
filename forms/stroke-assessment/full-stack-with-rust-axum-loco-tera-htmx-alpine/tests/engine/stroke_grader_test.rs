use stroke_assessment_tera_crate::engine::stroke_grader::calculate_severity;
use stroke_assessment_tera_crate::engine::stroke_rules::all_rules;
use stroke_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_minor_stroke_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.full_name = "John Smith".to_string();
    data.patient_information.date_of_birth = "1960-05-15".to_string();
    data.patient_information.nhs_number = "123 456 7890".to_string();
    data.patient_information.gp_name = "Dr Jones".to_string();
    data.patient_information.gp_practice = "Riverside Surgery".to_string();

    // Event Details
    data.event_details.symptom_onset_date = "2026-03-09".to_string();
    data.event_details.symptom_onset_time = "14:30".to_string();
    data.event_details.stroke_code = "yes".to_string();
    data.event_details.facial_droop = "yes".to_string();
    data.event_details.arm_weakness = "no".to_string();
    data.event_details.speech_difficulty = "no".to_string();
    data.event_details.tia_or_stroke = "stroke".to_string();

    // NIHSS Assessment — minor (total = 3)
    data.nihss_assessment.consciousness = Some(0);
    data.nihss_assessment.orientation_questions = Some(0);
    data.nihss_assessment.response_to_commands = Some(0);
    data.nihss_assessment.best_gaze = Some(0);
    data.nihss_assessment.visual_fields = Some(0);
    data.nihss_assessment.facial_palsy = Some(1);
    data.nihss_assessment.motor_left_arm = Some(0);
    data.nihss_assessment.motor_right_arm = Some(1);
    data.nihss_assessment.motor_left_leg = Some(0);
    data.nihss_assessment.motor_right_leg = Some(1);
    data.nihss_assessment.limb_ataxia = Some(0);
    data.nihss_assessment.sensory = Some(0);
    data.nihss_assessment.language = Some(0);
    data.nihss_assessment.dysarthria = Some(0);
    data.nihss_assessment.neglect = Some(0);

    // Stroke Classification
    data.stroke_classification.stroke_type = "ischaemic".to_string();
    data.stroke_classification.bamford_classification = "laci".to_string();
    data.stroke_classification.side_affected = "right".to_string();

    // Risk Factors
    data.risk_factors.hypertension = "yes".to_string();
    data.risk_factors.atrial_fibrillation = "no".to_string();
    data.risk_factors.diabetes = "no".to_string();
    data.risk_factors.previous_stroke = "no".to_string();
    data.risk_factors.previous_tia = "no".to_string();
    data.risk_factors.carotid_stenosis = "none".to_string();

    // Acute Treatment
    data.acute_treatment.thrombolysis = "no".to_string();
    data.acute_treatment.thrombectomy = "no".to_string();
    data.acute_treatment.antiplatelet = "aspirin".to_string();
    data.acute_treatment.swallow_assessment = "pass".to_string();
    data.acute_treatment.bp_management = "oral antihypertensive".to_string();

    // Functional Assessment
    data.functional_assessment.modified_rankin_score = Some(1);
    data.functional_assessment.mobility_status = "independent".to_string();
    data.functional_assessment.mood_screening = "normal".to_string();

    // Secondary Prevention
    data.secondary_prevention.antiplatelet_therapy = "clopidogrel".to_string();
    data.secondary_prevention.statin_therapy = "yes".to_string();
    data.secondary_prevention.antihypertensive = "yes".to_string();
    data.secondary_prevention.lifestyle_advice = "yes".to_string();
    data.secondary_prevention.driving_advice = "yes".to_string();

    // Clinical Review
    data.clinical_review.clinician_name = "Dr Williams".to_string();
    data.clinical_review.review_date = "2026-03-09".to_string();
    data.clinical_review.referrals = "physiotherapy".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, nihss_total, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "draft");
    assert_eq!(nihss_total, 0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_minor_for_low_nihss() {
    let data = create_minor_stroke_assessment();
    let (level, nihss_total, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "minor");
    assert_eq!(nihss_total, 3);
}

#[test]
fn returns_moderate_for_nihss_5_to_15() {
    let mut data = create_minor_stroke_assessment();
    // Set NIHSS items to total = 10
    data.nihss_assessment.consciousness = Some(0);
    data.nihss_assessment.orientation_questions = Some(1);
    data.nihss_assessment.response_to_commands = Some(1);
    data.nihss_assessment.best_gaze = Some(1);
    data.nihss_assessment.visual_fields = Some(1);
    data.nihss_assessment.facial_palsy = Some(1);
    data.nihss_assessment.motor_left_arm = Some(0);
    data.nihss_assessment.motor_right_arm = Some(2);
    data.nihss_assessment.motor_left_leg = Some(0);
    data.nihss_assessment.motor_right_leg = Some(2);
    data.nihss_assessment.limb_ataxia = Some(0);
    data.nihss_assessment.sensory = Some(1);
    data.nihss_assessment.language = Some(0);
    data.nihss_assessment.dysarthria = Some(0);
    data.nihss_assessment.neglect = Some(0);

    let (level, nihss_total, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "moderate");
    assert_eq!(nihss_total, 10);
}

#[test]
fn returns_moderate_severe_for_nihss_16_to_20() {
    let mut data = create_minor_stroke_assessment();
    // Set NIHSS items to total = 18
    data.nihss_assessment.consciousness = Some(1);
    data.nihss_assessment.orientation_questions = Some(2);
    data.nihss_assessment.response_to_commands = Some(1);
    data.nihss_assessment.best_gaze = Some(1);
    data.nihss_assessment.visual_fields = Some(2);
    data.nihss_assessment.facial_palsy = Some(2);
    data.nihss_assessment.motor_left_arm = Some(0);
    data.nihss_assessment.motor_right_arm = Some(3);
    data.nihss_assessment.motor_left_leg = Some(0);
    data.nihss_assessment.motor_right_leg = Some(3);
    data.nihss_assessment.limb_ataxia = Some(0);
    data.nihss_assessment.sensory = Some(1);
    data.nihss_assessment.language = Some(1);
    data.nihss_assessment.dysarthria = Some(1);
    data.nihss_assessment.neglect = Some(0);

    let (level, nihss_total, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "moderateSevere");
    assert_eq!(nihss_total, 18);
}

#[test]
fn returns_severe_for_nihss_21_plus() {
    let mut data = create_minor_stroke_assessment();
    // Set NIHSS items to total = 25
    data.nihss_assessment.consciousness = Some(2);
    data.nihss_assessment.orientation_questions = Some(2);
    data.nihss_assessment.response_to_commands = Some(2);
    data.nihss_assessment.best_gaze = Some(2);
    data.nihss_assessment.visual_fields = Some(2);
    data.nihss_assessment.facial_palsy = Some(2);
    data.nihss_assessment.motor_left_arm = Some(1);
    data.nihss_assessment.motor_right_arm = Some(3);
    data.nihss_assessment.motor_left_leg = Some(1);
    data.nihss_assessment.motor_right_leg = Some(3);
    data.nihss_assessment.limb_ataxia = Some(1);
    data.nihss_assessment.sensory = Some(1);
    data.nihss_assessment.language = Some(1);
    data.nihss_assessment.dysarthria = Some(1);
    data.nihss_assessment.neglect = Some(1);

    let (level, nihss_total, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "severe");
    assert_eq!(nihss_total, 25);
    // STR-001 (severe) should fire
    assert!(fired_rules.iter().any(|r| r.id == "STR-001"));
}

#[test]
fn fires_consciousness_impaired_rule() {
    let mut data = create_minor_stroke_assessment();
    data.nihss_assessment.consciousness = Some(2);

    let (_level, _nihss_total, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "STR-002"));
}

#[test]
fn fires_taci_rule() {
    let mut data = create_minor_stroke_assessment();
    data.stroke_classification.bamford_classification = "taci".to_string();

    let (_level, _nihss_total, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "STR-003"));
}

#[test]
fn fires_haemorrhagic_rule() {
    let mut data = create_minor_stroke_assessment();
    data.stroke_classification.stroke_type = "haemorrhagic".to_string();

    let (_level, _nihss_total, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "STR-004"));
}

#[test]
fn fires_good_recovery_rule() {
    let data = create_minor_stroke_assessment();
    let (_level, _nihss_total, fired_rules) = calculate_severity(&data);
    // mRS = 1 should fire STR-018
    assert!(fired_rules.iter().any(|r| r.id == "STR-018"));
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
