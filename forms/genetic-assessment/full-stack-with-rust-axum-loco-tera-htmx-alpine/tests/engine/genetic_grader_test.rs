use genetic_assessment_tera_crate::engine::genetic_grader::calculate_risk;
use genetic_assessment_tera_crate::engine::genetic_rules::all_rules;
use genetic_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_low_risk_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1985-06-15".to_string();
    data.patient_information.sex = "female".to_string();
    data.patient_information.nhs_number = "123 456 7890".to_string();

    data.referral_reason.referral_indication = "familyHistory".to_string();
    data.referral_reason.referring_clinician = "Dr Jones".to_string();
    data.referral_reason.urgency = "routine".to_string();
    data.referral_reason.referral_date = "2026-03-01".to_string();

    // No cancer history
    data.personal_medical_history.personal_cancer_history = "no".to_string();
    data.personal_medical_history.bilateral_cancer = "no".to_string();
    data.personal_medical_history.multiple_primary_cancers = "no".to_string();

    // Minimal family history - one relative over 50
    data.family_pedigree.paternal_grandfather_cancers = "prostate cancer".to_string();
    data.family_pedigree.paternal_grandfather_age_at_diagnosis = "72".to_string();

    // No cardiac issues
    data.cardiac_genetic_risk.familial_hypercholesterolemia = "no".to_string();
    data.cardiac_genetic_risk.cardiomyopathy = "no".to_string();
    data.cardiac_genetic_risk.aortic_aneurysm = "no".to_string();
    data.cardiac_genetic_risk.sudden_cardiac_death = "no".to_string();
    data.cardiac_genetic_risk.early_onset_cvd = "no".to_string();

    // No reproductive issues
    data.reproductive_genetics.consanguinity = "no".to_string();
    data.reproductive_genetics.carrier_status = "no".to_string();
    data.reproductive_genetics.recurrent_miscarriages = "no".to_string();
    data.reproductive_genetics.previous_affected_child = "no".to_string();

    // No previous tests
    data.genetic_testing_status.previous_genetic_tests = "no".to_string();
    data.genetic_testing_status.variants_of_uncertain_significance = "no".to_string();
    data.genetic_testing_status.known_familial_variant = "no".to_string();

    // Psychologically ready
    data.psychological_impact.psychological_readiness = "ready".to_string();
    data.psychological_impact.genetic_counselling = "no".to_string();
    data.psychological_impact.insurance_implications = "no".to_string();
    data.psychological_impact.support_needs = "no".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_risk(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_low_risk_for_minimal_family_history() {
    let data = create_low_risk_assessment();
    let (level, _score, _fired_rules) = calculate_risk(&data);
    assert_eq!(level, "lowRisk");
}

#[test]
fn returns_moderate_risk_for_personal_cancer_under_50() {
    let mut data = create_low_risk_assessment();
    data.personal_medical_history.personal_cancer_history = "yes".to_string();
    data.personal_medical_history.cancer_type = "breast".to_string();
    data.personal_medical_history.age_at_diagnosis = Some(42);

    let (level, score, fired_rules) = calculate_risk(&data);
    assert_eq!(level, "moderateRisk");
    assert!(score >= 3);
    assert!(fired_rules.iter().any(|r| r.id == "GEN-006")); // Cancer < 50
}

#[test]
fn returns_high_risk_for_brca_positive() {
    let mut data = create_low_risk_assessment();
    data.cancer_risk_assessment.brca_result = "positive".to_string();

    let (level, score, fired_rules) = calculate_risk(&data);
    // BRCA positive = weight 5 from GEN-001, plus GEN-019 (single relative over 50) = 1
    assert!(score >= 5);
    assert!(fired_rules.iter().any(|r| r.id == "GEN-001"));
    assert!(level == "highRisk" || level == "confirmed");
}

#[test]
fn returns_confirmed_for_multiple_high_risk_factors() {
    let mut data = create_low_risk_assessment();
    data.cancer_risk_assessment.brca_result = "positive".to_string(); // GEN-001: weight 5
    data.personal_medical_history.bilateral_cancer = "yes".to_string(); // GEN-003: weight 4
    data.personal_medical_history.personal_cancer_history = "yes".to_string();
    data.personal_medical_history.age_at_diagnosis = Some(38); // GEN-006: weight 3

    let (level, score, _fired_rules) = calculate_risk(&data);
    assert_eq!(level, "confirmed");
    assert!(score >= 10);
}

#[test]
fn fires_consanguinity_with_affected_child_rule() {
    let mut data = create_low_risk_assessment();
    data.reproductive_genetics.consanguinity = "yes".to_string();
    data.reproductive_genetics.previous_affected_child = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GEN-004")); // Consanguinity + affected child
    assert!(fired_rules.iter().any(|r| r.id == "GEN-013")); // Consanguinity alone
}

#[test]
fn fires_known_familial_variant_untested_rule() {
    let mut data = create_low_risk_assessment();
    data.genetic_testing_status.known_familial_variant = "yes".to_string();
    data.genetic_testing_status.previous_genetic_tests = "no".to_string();

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GEN-005")); // Familial variant untested
}

#[test]
fn fires_multiple_affected_under50_rule() {
    let mut data = create_low_risk_assessment();
    data.family_pedigree.mother_cancers = "breast cancer".to_string();
    data.family_pedigree.mother_age_at_diagnosis = "42".to_string();
    data.family_pedigree.maternal_grandmother_cancers = "ovarian cancer".to_string();
    data.family_pedigree.maternal_grandmother_age_at_diagnosis = "45".to_string();

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GEN-002")); // Multiple affected <50
}

#[test]
fn fires_manchester_score_rule() {
    let mut data = create_low_risk_assessment();
    data.cancer_risk_assessment.manchester_score = Some(18);

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GEN-009")); // Manchester >= 15
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
