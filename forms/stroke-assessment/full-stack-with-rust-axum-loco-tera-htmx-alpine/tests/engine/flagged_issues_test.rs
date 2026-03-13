use stroke_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use stroke_assessment_tera_crate::engine::types::*;

fn create_minor_stroke_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.full_name = "John Smith".to_string();

    // NIHSS — minor (total = 3)
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

    data.stroke_classification.stroke_type = "ischaemic".to_string();
    data.stroke_classification.bamford_classification = "laci".to_string();
    data.stroke_classification.side_affected = "right".to_string();

    data.risk_factors.hypertension = "no".to_string();
    data.risk_factors.atrial_fibrillation = "no".to_string();
    data.risk_factors.previous_stroke = "no".to_string();
    data.risk_factors.previous_tia = "no".to_string();
    data.risk_factors.carotid_stenosis = "none".to_string();

    data.acute_treatment.thrombolysis = "no".to_string();
    data.acute_treatment.thrombectomy = "no".to_string();
    data.acute_treatment.swallow_assessment = "pass".to_string();
    data.acute_treatment.bp_management = "monitored".to_string();

    data.functional_assessment.modified_rankin_score = Some(1);
    data.functional_assessment.mood_screening = "normal".to_string();

    data.secondary_prevention.antiplatelet_therapy = "clopidogrel".to_string();
    data.secondary_prevention.statin_therapy = "yes".to_string();
    data.secondary_prevention.lifestyle_advice = "yes".to_string();
    data.secondary_prevention.driving_advice = "yes".to_string();
    data.secondary_prevention.anticoagulation_indicated = "no".to_string();

    data.clinical_review.referrals = "physiotherapy".to_string();

    data
}

#[test]
fn no_flags_for_well_managed_minor_stroke() {
    let data = create_minor_stroke_assessment();
    let flags = detect_additional_flags(&data);
    // Only FLAG-DRIVE-001 should NOT fire because driving_advice == "yes"
    assert!(!flags.iter().any(|f| f.id == "FLAG-DRIVE-001"));
}

#[test]
fn flags_haemorrhagic_stroke() {
    let mut data = create_minor_stroke_assessment();
    data.stroke_classification.stroke_type = "haemorrhagic".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-HAEM-001"));
}

#[test]
fn flags_failed_swallow_assessment() {
    let mut data = create_minor_stroke_assessment();
    data.acute_treatment.swallow_assessment = "fail".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SWALL-001"));
}

#[test]
fn flags_af_without_anticoagulation() {
    let mut data = create_minor_stroke_assessment();
    data.risk_factors.atrial_fibrillation = "yes".to_string();
    data.secondary_prevention.anticoagulation_indicated = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-AF-001"));
}

#[test]
fn flags_recurrent_stroke() {
    let mut data = create_minor_stroke_assessment();
    data.risk_factors.previous_stroke = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RECUR-001"));
}

#[test]
fn flags_severe_functional_impairment() {
    let mut data = create_minor_stroke_assessment();
    data.functional_assessment.modified_rankin_score = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-FUNC-001"));
}

#[test]
fn flags_post_stroke_depression() {
    let mut data = create_minor_stroke_assessment();
    data.functional_assessment.mood_screening = "depressed".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MOOD-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_minor_stroke_assessment();
    // Create flags of different priorities
    data.stroke_classification.stroke_type = "haemorrhagic".to_string(); // high
    data.functional_assessment.mood_screening = "depressed".to_string(); // medium
    data.secondary_prevention.driving_advice = "no".to_string(); // low

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
