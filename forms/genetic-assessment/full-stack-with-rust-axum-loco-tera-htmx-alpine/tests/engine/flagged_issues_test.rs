use genetic_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use genetic_assessment_tera_crate::engine::types::*;

fn create_low_risk_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.referral_reason.referral_indication = "familyHistory".to_string();
    data.referral_reason.urgency = "routine".to_string();

    data.personal_medical_history.personal_cancer_history = "no".to_string();
    data.personal_medical_history.bilateral_cancer = "no".to_string();

    data.cardiac_genetic_risk.sudden_cardiac_death = "no".to_string();

    data.reproductive_genetics.consanguinity = "no".to_string();
    data.reproductive_genetics.previous_affected_child = "no".to_string();
    data.reproductive_genetics.prenatal_testing_wishes = "no".to_string();

    data.genetic_testing_status.previous_genetic_tests = "no".to_string();
    data.genetic_testing_status.variants_of_uncertain_significance = "no".to_string();
    data.genetic_testing_status.known_familial_variant = "no".to_string();

    data.psychological_impact.psychological_readiness = "ready".to_string();
    data.psychological_impact.genetic_counselling = "yes".to_string();
    data.psychological_impact.insurance_implications = "no".to_string();
    data.psychological_impact.support_needs = "no".to_string();
    data.psychological_impact.family_communication = "comfortable".to_string();

    data.clinical_review.cascade_testing_needed = "no".to_string();

    data
}

#[test]
fn no_flags_for_low_risk_patient() {
    let data = create_low_risk_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_brca_positive() {
    let mut data = create_low_risk_assessment();
    data.cancer_risk_assessment.brca_result = "positive".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-GEN-007"));
}

#[test]
fn flags_cascade_testing_needed() {
    let mut data = create_low_risk_assessment();
    data.clinical_review.cascade_testing_needed = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-GEN-002"));
}

#[test]
fn flags_reproductive_counselling_for_affected_child() {
    let mut data = create_low_risk_assessment();
    data.reproductive_genetics.previous_affected_child = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-GEN-003"));
}

#[test]
fn flags_psychological_support() {
    let mut data = create_low_risk_assessment();
    data.psychological_impact.psychological_readiness = "notReady".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-GEN-004"));
}

#[test]
fn flags_predictive_testing_without_counselling() {
    let mut data = create_low_risk_assessment();
    data.genetic_testing_status.known_familial_variant = "yes".to_string();
    data.psychological_impact.genetic_counselling = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-GEN-006"));
}

#[test]
fn flags_sudden_cardiac_death() {
    let mut data = create_low_risk_assessment();
    data.cardiac_genetic_risk.sudden_cardiac_death = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-GEN-010"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_low_risk_assessment();
    // Create flags of different priorities
    data.cardiac_genetic_risk.sudden_cardiac_death = "yes".to_string(); // high
    data.psychological_impact.insurance_implications = "yes".to_string(); // medium
    data.psychological_impact.family_communication = "difficult".to_string(); // low

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
