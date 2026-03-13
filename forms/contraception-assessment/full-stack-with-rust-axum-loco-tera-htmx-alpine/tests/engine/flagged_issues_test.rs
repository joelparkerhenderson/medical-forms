use contraception_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use contraception_assessment_tera_crate::engine::types::*;

fn create_safe_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.consultation_date = "2026-03-09".to_string();

    data.reproductive_history.pregnancy_possible = "no".to_string();
    data.reproductive_history.breastfeeding = "no".to_string();
    data.reproductive_history.ectopic_history = "no".to_string();
    data.reproductive_history.current_sti_risk = "no".to_string();

    data.medical_history.vte_history = "no".to_string();
    data.medical_history.vte_family_history = "no".to_string();
    data.medical_history.breast_cancer_current = "no".to_string();
    data.medical_history.liver_disease = "none".to_string();
    data.medical_history.diabetes_complications = "no".to_string();

    data.cardiovascular_risk.systolic_bp = Some(120);
    data.cardiovascular_risk.diastolic_bp = Some(78);
    data.cardiovascular_risk.migraine_with_aura = "no".to_string();

    data.current_medications.anticonvulsants = "no".to_string();
    data.current_medications.rifampicin_rifabutin = "no".to_string();

    data.smoking_bmi.bmi = Some(24.0);
    data.smoking_bmi.bmi_over_35 = "no".to_string();
    data.smoking_bmi.age_over_35_smoking = "no".to_string();

    data.clinical_review.cervical_screening_status = "upToDate".to_string();
    data.counselling.consent_obtained = "yes".to_string();

    data
}

#[test]
fn no_flags_for_safe_patient() {
    let data = create_safe_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_vte_risk() {
    let mut data = create_safe_assessment();
    data.medical_history.vte_history = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-VTE-001"));
}

#[test]
fn flags_migraine_with_aura() {
    let mut data = create_safe_assessment();
    data.cardiovascular_risk.migraine_with_aura = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MIGRAINE-001"));
}

#[test]
fn flags_severe_hypertension() {
    let mut data = create_safe_assessment();
    data.cardiovascular_risk.systolic_bp = Some(165);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BP-001"));
}

#[test]
fn flags_bmi_over_35() {
    let mut data = create_safe_assessment();
    data.smoking_bmi.bmi = Some(38.0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BMI-001"));
}

#[test]
fn flags_breastfeeding() {
    let mut data = create_safe_assessment();
    data.reproductive_history.breastfeeding = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BF-001"));
}

#[test]
fn flags_drug_interactions() {
    let mut data = create_safe_assessment();
    data.current_medications.rifampicin_rifabutin = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-DRUG-001"));
}

#[test]
fn flags_sti_screening_needed() {
    let mut data = create_safe_assessment();
    data.reproductive_history.current_sti_risk = "yes".to_string();
    data.reproductive_history.last_sti_screen_date = "".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-STI-001"));
}

#[test]
fn flags_cervical_screening_overdue() {
    let mut data = create_safe_assessment();
    data.clinical_review.cervical_screening_status = "overdue".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CERV-001"));
}

#[test]
fn flags_current_breast_cancer() {
    let mut data = create_safe_assessment();
    data.medical_history.breast_cancer_current = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CANCER-001"));
}

#[test]
fn flags_active_liver_disease() {
    let mut data = create_safe_assessment();
    data.medical_history.liver_disease = "active".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-LIVER-001"));
}

#[test]
fn flags_diabetes_with_complications() {
    let mut data = create_safe_assessment();
    data.medical_history.diabetes_complications = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-DM-001"));
}

#[test]
fn flags_smoker_over_35() {
    let mut data = create_safe_assessment();
    data.smoking_bmi.age_over_35_smoking = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SMOKE-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_safe_assessment();
    // Create flags of different priorities
    data.cardiovascular_risk.migraine_with_aura = "yes".to_string(); // high
    data.smoking_bmi.age_over_35_smoking = "yes".to_string(); // medium
    data.reproductive_history.ectopic_history = "yes".to_string(); // low

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
