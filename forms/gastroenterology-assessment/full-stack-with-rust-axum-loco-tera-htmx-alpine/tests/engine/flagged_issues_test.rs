use gastroenterology_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use gastroenterology_assessment_tera_crate::engine::types::*;

fn create_mild_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.primary_diagnosis = "IBS".to_string();

    data.upper_gi_symptoms.heartburn_frequency = Some(1);
    data.upper_gi_symptoms.heartburn_severity = Some(1);
    data.upper_gi_symptoms.dysphagia_grade = Some(0);
    data.upper_gi_symptoms.nausea_frequency = Some(1);
    data.upper_gi_symptoms.vomiting_frequency = Some(0);
    data.upper_gi_symptoms.early_satiety = Some(1);
    data.upper_gi_symptoms.epigastric_pain = Some(1);

    data.lower_gi_symptoms.bowel_habit_change = "none".to_string();
    data.lower_gi_symptoms.rectal_bleeding = "no".to_string();
    data.lower_gi_symptoms.rectal_bleeding_frequency = Some(0);
    data.lower_gi_symptoms.abdominal_pain_severity = Some(1);
    data.lower_gi_symptoms.bloating_severity = Some(1);
    data.lower_gi_symptoms.nocturnal_symptoms = "no".to_string();

    data.alarm_features.unintentional_weight_loss = "no".to_string();
    data.alarm_features.dysphagia_present = "no".to_string();
    data.alarm_features.gi_bleeding = "no".to_string();
    data.alarm_features.iron_deficiency_anaemia = "no".to_string();
    data.alarm_features.palpable_mass = "no".to_string();
    data.alarm_features.jaundice = "no".to_string();
    data.alarm_features.fever_unexplained = "no".to_string();
    data.alarm_features.age_over_50_new_symptoms = "no".to_string();

    data.nutritional_assessment.albumin_g_l = Some(40.0);
    data.nutritional_assessment.bmi = Some(25.0);
    data.nutritional_assessment.must_screening_score = Some(0);

    data.liver_assessment.alt_u_l = Some(25.0);
    data.liver_assessment.ast_u_l = Some(22.0);
    data.liver_assessment.bilirubin_umol_l = Some(12.0);
    data.liver_assessment.ascites = "no".to_string();

    data.investigations.h_pylori_test = "done".to_string();
    data.investigations.coeliac_screen = "done".to_string();
    data.investigations.endoscopy_needed = "no".to_string();

    data.current_treatment.nsaid_use = "no".to_string();
    data.current_treatment.anticoagulant_use = "no".to_string();

    data.clinical_review.ibd_activity_index = Some(0);
    data.clinical_review.quality_of_life_impact = Some(1);

    data.gi_history.family_cancer_history = "no".to_string();

    data
}

#[test]
fn no_flags_for_mild_patient() {
    let data = create_mild_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_two_week_wait_cancer_pathway() {
    let mut data = create_mild_assessment();
    data.alarm_features.gi_bleeding = "yes".to_string();
    data.alarm_features.age_over_50_new_symptoms = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-TWW-001"));
}

#[test]
fn flags_urgent_endoscopy_for_progressive_dysphagia() {
    let mut data = create_mild_assessment();
    data.upper_gi_symptoms.dysphagia_grade = Some(4);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ENDO-001"));
}

#[test]
fn flags_coeliac_screening() {
    let mut data = create_mild_assessment();
    data.lower_gi_symptoms.bowel_habit_change = "diarrhoea".to_string();
    data.alarm_features.iron_deficiency_anaemia = "yes".to_string();
    data.investigations.coeliac_screen = "pending".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-COEL-001"));
}

#[test]
fn flags_h_pylori_testing() {
    let mut data = create_mild_assessment();
    data.upper_gi_symptoms.epigastric_pain = Some(3);
    data.investigations.h_pylori_test = "pending".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-HP-001"));
}

#[test]
fn flags_liver_cirrhosis_concern() {
    let mut data = create_mild_assessment();
    data.liver_assessment.ascites = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CIRR-001"));
}

#[test]
fn flags_malnutrition_risk() {
    let mut data = create_mild_assessment();
    data.nutritional_assessment.must_screening_score = Some(3);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-NUTR-001"));
}

#[test]
fn flags_ibd_flare() {
    let mut data = create_mild_assessment();
    data.clinical_review.ibd_activity_index = Some(3);
    data.lower_gi_symptoms.rectal_bleeding = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-IBD-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_mild_assessment();
    // Create flags of different priorities
    data.upper_gi_symptoms.dysphagia_grade = Some(4); // high (ENDO)
    data.upper_gi_symptoms.epigastric_pain = Some(3); // medium (HP)
    data.investigations.h_pylori_test = "pending".to_string();
    data.nutritional_assessment.must_screening_score = Some(3); // medium (NUTR)

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
