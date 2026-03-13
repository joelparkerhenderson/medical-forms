use gastroenterology_assessment_tera_crate::engine::gi_grader::calculate_severity;
use gastroenterology_assessment_tera_crate::engine::gi_rules::all_rules;
use gastroenterology_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_mild_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1985-03-15".to_string();
    data.patient_information.patient_sex = "female".to_string();
    data.patient_information.patient_age = "31to50".to_string();
    data.patient_information.referring_physician = "Dr Jones".to_string();
    data.patient_information.referral_date = "2026-03-01".to_string();
    data.patient_information.primary_diagnosis = "IBS".to_string();
    data.patient_information.visit_type = "newReferral".to_string();

    // Upper GI Symptoms — all 1s (mild)
    data.upper_gi_symptoms.heartburn_frequency = Some(1);
    data.upper_gi_symptoms.heartburn_severity = Some(1);
    data.upper_gi_symptoms.dysphagia_grade = Some(0);
    data.upper_gi_symptoms.odynophagia = "no".to_string();
    data.upper_gi_symptoms.nausea_frequency = Some(1);
    data.upper_gi_symptoms.vomiting_frequency = Some(0);
    data.upper_gi_symptoms.early_satiety = Some(1);
    data.upper_gi_symptoms.epigastric_pain = Some(1);

    // Lower GI Symptoms
    data.lower_gi_symptoms.bowel_habit_change = "alternating".to_string();
    data.lower_gi_symptoms.stool_frequency = "3to5".to_string();
    data.lower_gi_symptoms.stool_consistency = "type5".to_string();
    data.lower_gi_symptoms.rectal_bleeding = "no".to_string();
    data.lower_gi_symptoms.rectal_bleeding_frequency = Some(0);
    data.lower_gi_symptoms.abdominal_pain_severity = Some(1);
    data.lower_gi_symptoms.bloating_severity = Some(1);
    data.lower_gi_symptoms.tenesmus = "no".to_string();
    data.lower_gi_symptoms.nocturnal_symptoms = "no".to_string();

    // Alarm Features — none
    data.alarm_features.unintentional_weight_loss = "no".to_string();
    data.alarm_features.dysphagia_present = "no".to_string();
    data.alarm_features.gi_bleeding = "no".to_string();
    data.alarm_features.iron_deficiency_anaemia = "no".to_string();
    data.alarm_features.palpable_mass = "no".to_string();
    data.alarm_features.jaundice = "no".to_string();
    data.alarm_features.fever_unexplained = "no".to_string();
    data.alarm_features.age_over_50_new_symptoms = "no".to_string();

    // Nutritional Assessment
    data.nutritional_assessment.current_weight_kg = Some(68.0);
    data.nutritional_assessment.height_cm = Some(165.0);
    data.nutritional_assessment.bmi = Some(25.0);
    data.nutritional_assessment.albumin_g_l = Some(40.0);
    data.nutritional_assessment.appetite_change = "normal".to_string();
    data.nutritional_assessment.must_screening_score = Some(0);

    // Liver Assessment — normal
    data.liver_assessment.alt_u_l = Some(25.0);
    data.liver_assessment.ast_u_l = Some(22.0);
    data.liver_assessment.alp_u_l = Some(70.0);
    data.liver_assessment.bilirubin_umol_l = Some(12.0);
    data.liver_assessment.ascites = "no".to_string();
    data.liver_assessment.hepatomegaly = "no".to_string();

    // Investigations
    data.investigations.endoscopy_needed = "no".to_string();

    // Current Treatment
    data.current_treatment.nsaid_use = "no".to_string();
    data.current_treatment.anticoagulant_use = "no".to_string();

    // Clinical Review
    data.clinical_review.ibd_activity_index = Some(0);
    data.clinical_review.quality_of_life_impact = Some(1);
    data.clinical_review.smoking_status = "never".to_string();

    // GI History
    data.gi_history.family_cancer_history = "no".to_string();

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
fn returns_mild_for_low_severity() {
    let data = create_mild_assessment();
    let (level, _score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "mild");
}

#[test]
fn returns_alarm_for_multiple_alarm_features() {
    let mut data = create_mild_assessment();
    data.alarm_features.gi_bleeding = "yes".to_string();
    data.alarm_features.jaundice = "yes".to_string();
    data.alarm_features.dysphagia_present = "yes".to_string();

    let (level, _score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "alarm");
    assert!(fired_rules.iter().any(|r| r.id == "GI-001")); // Multiple alarm features
}

#[test]
fn returns_severe_for_single_alarm_feature() {
    let mut data = create_mild_assessment();
    data.alarm_features.gi_bleeding = "yes".to_string();

    let (level, _score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "severe");
    assert!(fired_rules.iter().any(|r| r.id == "GI-004")); // Active GI bleeding
}

#[test]
fn fires_dysphagia_rule_for_grade_3() {
    let mut data = create_mild_assessment();
    data.upper_gi_symptoms.dysphagia_grade = Some(3);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GI-003")); // Progressive dysphagia
}

#[test]
fn fires_jaundice_rule() {
    let mut data = create_mild_assessment();
    data.alarm_features.jaundice = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GI-005")); // Jaundice
}

#[test]
fn fires_weight_loss_rule_over_10_percent() {
    let mut data = create_mild_assessment();
    data.alarm_features.unintentional_weight_loss = "yes".to_string();
    data.alarm_features.weight_loss_percentage = Some(12.0);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GI-002")); // Weight loss >10%
}

#[test]
fn fires_elevated_liver_enzyme_rule() {
    let mut data = create_mild_assessment();
    data.liver_assessment.alt_u_l = Some(150.0);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GI-011")); // Elevated liver enzymes
}

#[test]
fn fires_normal_liver_function_rule() {
    let data = create_mild_assessment();
    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GI-020")); // Normal liver function
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
