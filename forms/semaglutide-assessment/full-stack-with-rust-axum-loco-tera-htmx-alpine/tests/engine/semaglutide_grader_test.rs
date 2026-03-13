use semaglutide_assessment_tera_crate::engine::semaglutide_grader::calculate_eligibility;
use semaglutide_assessment_tera_crate::engine::semaglutide_rules::all_rules;
use semaglutide_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_eligible_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.full_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1985-06-15".to_string();
    data.patient_information.sex = "female".to_string();
    data.patient_information.contact_phone = "07700900000".to_string();
    data.patient_information.referring_clinician = "Dr Jones".to_string();
    data.patient_information.assessment_date = "2026-03-01".to_string();
    data.patient_information.nhs_number = "123 456 7890".to_string();

    // Weight & BMI History
    data.weight_bmi_history.current_weight_kg = Some(95.0);
    data.weight_bmi_history.height_cm = Some(165.0);
    data.weight_bmi_history.current_bmi = Some(34.9);
    data.weight_bmi_history.highest_bmi = Some(38.0);
    data.weight_bmi_history.weight_loss_attempts = "dietAndExercise".to_string();
    data.weight_bmi_history.bariatric_surgery_history = "no".to_string();
    data.weight_bmi_history.weight_gain_duration = "5to10Years".to_string();

    // Medical History
    data.medical_history.type2_diabetes = "yes".to_string();
    data.medical_history.hypertension = "yes".to_string();
    data.medical_history.dyslipidaemia = "no".to_string();
    data.medical_history.obstructive_sleep_apnoea = "no".to_string();
    data.medical_history.cardiovascular_disease = "no".to_string();
    data.medical_history.pcos = "no".to_string();
    data.medical_history.nafld = "no".to_string();
    data.medical_history.osteoarthritis = "no".to_string();
    data.medical_history.depression_anxiety = "no".to_string();

    // Contraindications -- all no
    data.contraindications.personal_medullary_thyroid_cancer = "no".to_string();
    data.contraindications.family_men2 = "no".to_string();
    data.contraindications.pancreatitis_history = "no".to_string();
    data.contraindications.severe_gi_disease = "no".to_string();
    data.contraindications.pregnancy_or_planning = "no".to_string();
    data.contraindications.breastfeeding = "no".to_string();
    data.contraindications.type1_diabetes = "no".to_string();
    data.contraindications.severe_renal_impairment = "no".to_string();
    data.contraindications.known_hypersensitivity = "no".to_string();
    data.contraindications.eating_disorder = "no".to_string();

    // Current Medications
    data.current_medications.insulin_therapy = "no".to_string();
    data.current_medications.sulfonylureas = "no".to_string();
    data.current_medications.other_glp1_agonist = "no".to_string();
    data.current_medications.oral_contraceptives = "no".to_string();
    data.current_medications.warfarin = "no".to_string();
    data.current_medications.antihypertensives = "yes".to_string();
    data.current_medications.statins = "no".to_string();

    // Lifestyle Assessment -- all 4s (Good)
    data.lifestyle_assessment.diet_quality = Some(4);
    data.lifestyle_assessment.physical_activity_level = Some(4);
    data.lifestyle_assessment.alcohol_consumption = "occasional".to_string();
    data.lifestyle_assessment.smoking_status = "never".to_string();
    data.lifestyle_assessment.sleep_quality = Some(4);
    data.lifestyle_assessment.stress_level = Some(4);
    data.lifestyle_assessment.motivation_to_change = Some(4);
    data.lifestyle_assessment.social_support = Some(4);

    // Treatment Goals
    data.treatment_goals.target_weight_loss_percent = Some(10.0);
    data.treatment_goals.primary_goal = "combined".to_string();
    data.treatment_goals.glycaemic_control_goal = "yes".to_string();
    data.treatment_goals.cardiovascular_risk_reduction = "yes".to_string();
    data.treatment_goals.mobility_improvement = "yes".to_string();
    data.treatment_goals.quality_of_life_improvement = "yes".to_string();
    data.treatment_goals.realistic_expectations = Some(4);
    data.treatment_goals.commitment_to_lifestyle_changes = Some(4);

    // Informed Consent
    data.informed_consent.understands_mechanism = "yes".to_string();
    data.informed_consent.understands_side_effects = "yes".to_string();
    data.informed_consent.understands_injection_technique = "yes".to_string();
    data.informed_consent.understands_dose_escalation = "yes".to_string();
    data.informed_consent.understands_monitoring_requirements = "yes".to_string();
    data.informed_consent.consent_given = "yes".to_string();
    data.informed_consent.consent_date = "2026-03-01".to_string();
    data.informed_consent.clinician_name = "Dr Jones".to_string();

    // Monitoring Plan
    data.monitoring_plan.baseline_bloods_completed = "yes".to_string();
    data.monitoring_plan.hba1c_baseline = "7.2%".to_string();
    data.monitoring_plan.renal_function_checked = "yes".to_string();
    data.monitoring_plan.thyroid_function_checked = "yes".to_string();
    data.monitoring_plan.follow_up_interval_weeks = Some(4);
    data.monitoring_plan.weight_monitoring_frequency = "fortnightly".to_string();
    data.monitoring_plan.side_effect_monitoring_plan = "standard".to_string();
    data.monitoring_plan.dose_escalation_schedule = "standard4Weeks".to_string();

    // Clinical Review -- all 4s
    data.clinical_review.overall_eligibility_assessment = Some(4);
    data.clinical_review.benefit_risk_ratio = Some(4);
    data.clinical_review.patient_suitability = Some(4);
    data.clinical_review.clinical_confidence = Some(4);
    data.clinical_review.recommended_starting_dose = "0.25mg".to_string();
    data.clinical_review.additional_investigations_needed = "none".to_string();
    data.clinical_review.referrals_needed = "dietitian".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_eligible_for_good_candidate() {
    let data = create_eligible_assessment();
    let (level, score, _fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "eligible");
    assert_eq!(score, 75.0); // (4-1)/4 * 100 = 75
}

#[test]
fn returns_eligible_for_all_fives() {
    let mut data = create_eligible_assessment();
    // Set all Likert items to 5
    data.lifestyle_assessment.diet_quality = Some(5);
    data.lifestyle_assessment.physical_activity_level = Some(5);
    data.lifestyle_assessment.sleep_quality = Some(5);
    data.lifestyle_assessment.stress_level = Some(5);
    data.lifestyle_assessment.motivation_to_change = Some(5);
    data.lifestyle_assessment.social_support = Some(5);
    data.treatment_goals.realistic_expectations = Some(5);
    data.treatment_goals.commitment_to_lifestyle_changes = Some(5);
    data.clinical_review.overall_eligibility_assessment = Some(5);
    data.clinical_review.benefit_risk_ratio = Some(5);
    data.clinical_review.patient_suitability = Some(5);
    data.clinical_review.clinical_confidence = Some(5);

    let (level, score, _fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "eligible");
    assert_eq!(score, 100.0);
}

#[test]
fn returns_not_eligible_for_all_ones() {
    let mut data = create_eligible_assessment();
    // Set all Likert items to 1
    data.lifestyle_assessment.diet_quality = Some(1);
    data.lifestyle_assessment.physical_activity_level = Some(1);
    data.lifestyle_assessment.sleep_quality = Some(1);
    data.lifestyle_assessment.stress_level = Some(1);
    data.lifestyle_assessment.motivation_to_change = Some(1);
    data.lifestyle_assessment.social_support = Some(1);
    data.treatment_goals.realistic_expectations = Some(1);
    data.treatment_goals.commitment_to_lifestyle_changes = Some(1);
    data.clinical_review.overall_eligibility_assessment = Some(1);
    data.clinical_review.benefit_risk_ratio = Some(1);
    data.clinical_review.patient_suitability = Some(1);
    data.clinical_review.clinical_confidence = Some(1);

    let (level, score, fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "notEligible");
    assert_eq!(score, 0.0);
    assert!(fired_rules.iter().any(|r| r.concern_level == "high")); // Clinical review below 40%
}

#[test]
fn returns_caution_required_for_all_threes() {
    let mut data = create_eligible_assessment();
    // Set all Likert items to 3
    data.lifestyle_assessment.diet_quality = Some(3);
    data.lifestyle_assessment.physical_activity_level = Some(3);
    data.lifestyle_assessment.sleep_quality = Some(3);
    data.lifestyle_assessment.stress_level = Some(3);
    data.lifestyle_assessment.motivation_to_change = Some(3);
    data.lifestyle_assessment.social_support = Some(3);
    data.treatment_goals.realistic_expectations = Some(3);
    data.treatment_goals.commitment_to_lifestyle_changes = Some(3);
    data.clinical_review.overall_eligibility_assessment = Some(3);
    data.clinical_review.benefit_risk_ratio = Some(3);
    data.clinical_review.patient_suitability = Some(3);
    data.clinical_review.clinical_confidence = Some(3);

    let (level, score, _fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "cautionRequired");
    assert_eq!(score, 50.0); // (3-1)/4 * 100 = 50
}

#[test]
fn returns_contraindicated_for_thyroid_cancer() {
    let mut data = create_eligible_assessment();
    data.contraindications.personal_medullary_thyroid_cancer = "yes".to_string();

    let (level, _score, fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "contraindicated");
    assert!(fired_rules.iter().any(|r| r.id == "SEM-001"));
}

#[test]
fn returns_contraindicated_for_pancreatitis() {
    let mut data = create_eligible_assessment();
    data.contraindications.pancreatitis_history = "yes".to_string();

    let (level, _score, fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "contraindicated");
    assert!(fired_rules.iter().any(|r| r.id == "SEM-002"));
}

#[test]
fn fires_bmi_below_threshold_rule() {
    let mut data = create_eligible_assessment();
    data.weight_bmi_history.current_bmi = Some(25.0);

    let (_level, _score, fired_rules) = calculate_eligibility(&data);
    assert!(fired_rules.iter().any(|r| r.id == "SEM-006"));
}

#[test]
fn fires_positive_rules_for_excellent_clinical_review() {
    let mut data = create_eligible_assessment();
    // Set all clinical review items to 5
    data.clinical_review.overall_eligibility_assessment = Some(5);
    data.clinical_review.benefit_risk_ratio = Some(5);
    data.clinical_review.patient_suitability = Some(5);
    data.clinical_review.clinical_confidence = Some(5);

    let (_level, _score, fired_rules) = calculate_eligibility(&data);
    assert!(fired_rules.iter().any(|r| r.id == "SEM-017")); // All clinical review 4-5
}

#[test]
fn fires_high_motivation_positive_rule() {
    let mut data = create_eligible_assessment();
    data.lifestyle_assessment.motivation_to_change = Some(5);
    data.treatment_goals.commitment_to_lifestyle_changes = Some(5);

    let (_level, _score, fired_rules) = calculate_eligibility(&data);
    assert!(fired_rules.iter().any(|r| r.id == "SEM-018"));
}

#[test]
fn fires_full_consent_positive_rule() {
    let data = create_eligible_assessment();
    let (_level, _score, fired_rules) = calculate_eligibility(&data);
    assert!(fired_rules.iter().any(|r| r.id == "SEM-019")); // Full consent obtained
}

#[test]
fn fires_complete_monitoring_positive_rule() {
    let data = create_eligible_assessment();
    let (_level, _score, fired_rules) = calculate_eligibility(&data);
    assert!(fired_rules.iter().any(|r| r.id == "SEM-020")); // Complete baseline investigations
}

#[test]
fn fires_glp1_duplication_rule() {
    let mut data = create_eligible_assessment();
    data.current_medications.other_glp1_agonist = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_eligibility(&data);
    assert!(fired_rules.iter().any(|r| r.id == "SEM-007"));
}

#[test]
fn fires_consent_not_obtained_rule() {
    let mut data = create_eligible_assessment();
    data.informed_consent.consent_given = "no".to_string();

    let (_level, _score, fired_rules) = calculate_eligibility(&data);
    assert!(fired_rules.iter().any(|r| r.id == "SEM-014"));
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
fn has_exactly_20_rules() {
    let rules = all_rules();
    assert_eq!(rules.len(), 20);
}

#[test]
fn has_correct_concern_level_distribution() {
    let rules = all_rules();
    let high = rules.iter().filter(|r| r.concern_level == "high").count();
    let medium = rules.iter().filter(|r| r.concern_level == "medium").count();
    let low = rules.iter().filter(|r| r.concern_level == "low").count();
    assert_eq!(high, 5);
    assert_eq!(medium, 10);
    assert_eq!(low, 5);
}
