use semaglutide_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use semaglutide_assessment_tera_crate::engine::types::*;

fn create_eligible_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.full_name = "Jane Smith".to_string();
    data.patient_information.assessment_date = "2026-03-01".to_string();
    data.patient_information.referring_clinician = "Dr Jones".to_string();

    data.weight_bmi_history.current_bmi = Some(34.9);

    // All contraindications "no"
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

    // Medications -- all no
    data.current_medications.insulin_therapy = "no".to_string();
    data.current_medications.sulfonylureas = "no".to_string();
    data.current_medications.other_glp1_agonist = "no".to_string();
    data.current_medications.warfarin = "no".to_string();

    // Lifestyle
    data.lifestyle_assessment.motivation_to_change = Some(4);

    // Medical history
    data.medical_history.depression_anxiety = "no".to_string();

    // Consent
    data.informed_consent.consent_given = "yes".to_string();

    // Monitoring
    data.monitoring_plan.baseline_bloods_completed = "yes".to_string();

    data
}

#[test]
fn no_flags_for_eligible_patient() {
    let data = create_eligible_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_thyroid_cancer_contraindication() {
    let mut data = create_eligible_assessment();
    data.contraindications.personal_medullary_thyroid_cancer = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-THYROID-001"));
}

#[test]
fn flags_men2_family_history() {
    let mut data = create_eligible_assessment();
    data.contraindications.family_men2 = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-THYROID-002"));
}

#[test]
fn flags_pancreatitis_history() {
    let mut data = create_eligible_assessment();
    data.contraindications.pancreatitis_history = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PANC-001"));
}

#[test]
fn flags_pregnancy() {
    let mut data = create_eligible_assessment();
    data.contraindications.pregnancy_or_planning = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PREG-001"));
}

#[test]
fn flags_low_bmi() {
    let mut data = create_eligible_assessment();
    data.weight_bmi_history.current_bmi = Some(25.0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BMI-001"));
}

#[test]
fn flags_glp1_duplication() {
    let mut data = create_eligible_assessment();
    data.current_medications.other_glp1_agonist = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MED-001"));
}

#[test]
fn flags_eating_disorder() {
    let mut data = create_eligible_assessment();
    data.contraindications.eating_disorder = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PSYCH-001"));
}

#[test]
fn flags_low_motivation() {
    let mut data = create_eligible_assessment();
    data.lifestyle_assessment.motivation_to_change = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-LIFESTYLE-001"));
}

#[test]
fn flags_consent_not_obtained() {
    let mut data = create_eligible_assessment();
    data.informed_consent.consent_given = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CONSENT-001"));
}

#[test]
fn flags_depression_for_monitoring() {
    let mut data = create_eligible_assessment();
    data.medical_history.depression_anxiety = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PSYCH-002"));
}

#[test]
fn flags_warfarin_interaction() {
    let mut data = create_eligible_assessment();
    data.current_medications.warfarin = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MED-004"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_eligible_assessment();
    // Create flags of different priorities
    data.contraindications.personal_medullary_thyroid_cancer = "yes".to_string(); // high
    data.current_medications.warfarin = "yes".to_string(); // medium
    data.medical_history.depression_anxiety = "yes".to_string(); // low

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

#[test]
fn has_exactly_14_possible_flags() {
    // Test with all conditions that trigger flags
    let mut data = AssessmentData::default();
    data.contraindications.personal_medullary_thyroid_cancer = "yes".to_string();
    data.contraindications.family_men2 = "yes".to_string();
    data.contraindications.pancreatitis_history = "yes".to_string();
    data.contraindications.pregnancy_or_planning = "yes".to_string();
    data.weight_bmi_history.current_bmi = Some(25.0);
    data.current_medications.other_glp1_agonist = "yes".to_string();
    data.current_medications.insulin_therapy = "yes".to_string();
    data.current_medications.sulfonylureas = "yes".to_string();
    data.contraindications.eating_disorder = "yes".to_string();
    data.lifestyle_assessment.motivation_to_change = Some(1);
    data.informed_consent.consent_given = "no".to_string();
    data.monitoring_plan.baseline_bloods_completed = "no".to_string();
    data.medical_history.depression_anxiety = "yes".to_string();
    data.current_medications.warfarin = "yes".to_string();

    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 14);
}
