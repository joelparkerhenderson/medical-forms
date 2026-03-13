use prenatal_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use prenatal_assessment_tera_crate::engine::types::*;

fn create_low_risk_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1990-05-15".to_string();
    data.patient_information.gestational_age_weeks = Some(28);
    data.patient_information.estimated_due_date = "2026-06-15".to_string();
    data.patient_information.referring_provider = "Dr Jones".to_string();
    data.patient_information.booking_date = "2026-01-10".to_string();

    data.obstetric_history.previous_caesarean = "no".to_string();
    data.obstetric_history.previous_preterm_birth = "no".to_string();
    data.obstetric_history.previous_stillbirth = "no".to_string();
    data.obstetric_history.previous_preeclampsia = "no".to_string();
    data.obstetric_history.recurrent_miscarriage = "no".to_string();

    data.current_pregnancy.pregnancy_type = "singleton".to_string();
    data.current_pregnancy.vaginal_bleeding = "no".to_string();
    data.current_pregnancy.fetal_movements = "normal".to_string();

    data.physical_examination.blood_pressure_systolic = Some(120);
    data.physical_examination.blood_pressure_diastolic = Some(75);
    data.physical_examination.bmi = Some(24.5);
    data.physical_examination.proteinuria = "negative".to_string();

    data.blood_tests.haemoglobin = Some(125.0);

    data.ultrasound_findings.fetal_growth_centile = "normal".to_string();
    data.ultrasound_findings.structural_abnormalities = "none".to_string();
    data.ultrasound_findings.placental_position = "posterior".to_string();

    data.mental_health_wellbeing.domestic_abuse_screening = "negative".to_string();
    data.mental_health_wellbeing.substance_use = "no".to_string();
    data.mental_health_wellbeing.smoking_status = "never".to_string();

    data.clinical_review.safeguarding_concerns = "no".to_string();

    data
}

#[test]
fn no_flags_for_low_risk_patient() {
    let data = create_low_risk_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_severe_hypertension() {
    let mut data = create_low_risk_assessment();
    data.physical_examination.blood_pressure_systolic = Some(165);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BP-001"));
}

#[test]
fn flags_preeclampsia_risk() {
    let mut data = create_low_risk_assessment();
    data.physical_examination.blood_pressure_systolic = Some(145);
    data.physical_examination.proteinuria = "2plus".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BP-002"));
}

#[test]
fn flags_previous_stillbirth() {
    let mut data = create_low_risk_assessment();
    data.obstetric_history.previous_stillbirth = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-OBS-001"));
}

#[test]
fn flags_vaginal_bleeding() {
    let mut data = create_low_risk_assessment();
    data.current_pregnancy.vaginal_bleeding = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PREG-001"));
}

#[test]
fn flags_reduced_fetal_movements() {
    let mut data = create_low_risk_assessment();
    data.current_pregnancy.fetal_movements = "reduced".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PREG-002"));
}

#[test]
fn flags_structural_abnormalities() {
    let mut data = create_low_risk_assessment();
    data.ultrasound_findings.structural_abnormalities = "detected".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-US-001"));
}

#[test]
fn flags_severe_anaemia() {
    let mut data = create_low_risk_assessment();
    data.blood_tests.haemoglobin = Some(85.0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BLOOD-001"));
}

#[test]
fn flags_domestic_abuse() {
    let mut data = create_low_risk_assessment();
    data.mental_health_wellbeing.domestic_abuse_screening = "positive".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MH-001"));
}

#[test]
fn flags_smoking_in_pregnancy() {
    let mut data = create_low_risk_assessment();
    data.mental_health_wellbeing.smoking_status = "current".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MH-003"));
}

#[test]
fn flags_safeguarding_concerns() {
    let mut data = create_low_risk_assessment();
    data.clinical_review.safeguarding_concerns = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SAFE-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_low_risk_assessment();
    // Create flags of different priorities
    data.physical_examination.blood_pressure_systolic = Some(165); // high: FLAG-BP-001
    data.mental_health_wellbeing.smoking_status = "current".to_string(); // medium: FLAG-MH-003
    data.mental_health_wellbeing.substance_use = "yes".to_string(); // medium: FLAG-MH-002

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
