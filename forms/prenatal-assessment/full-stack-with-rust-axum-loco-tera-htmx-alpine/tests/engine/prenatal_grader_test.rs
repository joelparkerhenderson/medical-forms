use prenatal_assessment_tera_crate::engine::prenatal_grader::calculate_risk;
use prenatal_assessment_tera_crate::engine::prenatal_rules::all_rules;
use prenatal_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_low_risk_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1990-05-15".to_string();
    data.patient_information.nhs_number = "123 456 7890".to_string();
    data.patient_information.gestational_age_weeks = Some(28);
    data.patient_information.estimated_due_date = "2026-06-15".to_string();
    data.patient_information.referring_provider = "Dr Jones".to_string();
    data.patient_information.booking_date = "2026-01-10".to_string();
    data.patient_information.contact_phone = "07700 900000".to_string();

    // Obstetric History - no complications
    data.obstetric_history.gravida = Some(2);
    data.obstetric_history.para = Some(1);
    data.obstetric_history.previous_caesarean = "no".to_string();
    data.obstetric_history.previous_preterm_birth = "no".to_string();
    data.obstetric_history.previous_stillbirth = "no".to_string();
    data.obstetric_history.previous_preeclampsia = "no".to_string();
    data.obstetric_history.recurrent_miscarriage = "no".to_string();
    data.obstetric_history.inter_pregnancy_interval = "moreThan24months".to_string();

    // Current Pregnancy - normal
    data.current_pregnancy.pregnancy_type = "singleton".to_string();
    data.current_pregnancy.conception_method = "natural".to_string();
    data.current_pregnancy.vaginal_bleeding = "no".to_string();
    data.current_pregnancy.severe_nausea = "no".to_string();
    data.current_pregnancy.fetal_movements = "normal".to_string();
    data.current_pregnancy.gestational_diabetes_screening = "normal".to_string();
    data.current_pregnancy.rhesus_status = "positive".to_string();
    data.current_pregnancy.cervical_length = "normal".to_string();

    // Antenatal Screening - all low risk
    data.antenatal_screening.combined_screening_result = "lowRisk".to_string();
    data.antenatal_screening.anomaly_scan_result = "normal".to_string();
    data.antenatal_screening.nipt_result = "lowRisk".to_string();
    data.antenatal_screening.infectious_disease_screening = "negative".to_string();
    data.antenatal_screening.group_b_strep = "negative".to_string();
    data.antenatal_screening.screening_declined = "no".to_string();

    // Physical Examination - normal
    data.physical_examination.blood_pressure_systolic = Some(120);
    data.physical_examination.blood_pressure_diastolic = Some(75);
    data.physical_examination.bmi = Some(24.5);
    data.physical_examination.fundal_height = Some(28);
    data.physical_examination.fetal_heart_rate = Some(140);
    data.physical_examination.fetal_presentation = "cephalic".to_string();
    data.physical_examination.oedema = "none".to_string();
    data.physical_examination.proteinuria = "negative".to_string();

    // Blood Tests - normal
    data.blood_tests.haemoglobin = Some(125.0);
    data.blood_tests.platelet_count = Some(250);
    data.blood_tests.blood_group = "A+".to_string();
    data.blood_tests.antibody_screen = "negative".to_string();
    data.blood_tests.thyroid_function = "normal".to_string();
    data.blood_tests.liver_function = "normal".to_string();
    data.blood_tests.renal_function = "normal".to_string();

    // Ultrasound Findings - normal
    data.ultrasound_findings.dating_scan_consistent = "yes".to_string();
    data.ultrasound_findings.nuchal_translucency = "normal".to_string();
    data.ultrasound_findings.amniotic_fluid_index = "normal".to_string();
    data.ultrasound_findings.placental_position = "posterior".to_string();
    data.ultrasound_findings.fetal_growth_centile = "normal".to_string();
    data.ultrasound_findings.structural_abnormalities = "none".to_string();
    data.ultrasound_findings.doppler_findings = "normal".to_string();
    data.ultrasound_findings.cervical_length_scan = "normal".to_string();

    // Mental Health - no concerns
    data.mental_health_wellbeing.phq2_score = Some(0);
    data.mental_health_wellbeing.gad2_score = Some(1);
    data.mental_health_wellbeing.previous_mental_health_history = "none".to_string();
    data.mental_health_wellbeing.current_psychiatric_medication = "no".to_string();
    data.mental_health_wellbeing.social_support = "good".to_string();
    data.mental_health_wellbeing.domestic_abuse_screening = "negative".to_string();
    data.mental_health_wellbeing.substance_use = "no".to_string();
    data.mental_health_wellbeing.smoking_status = "never".to_string();

    // Birth Planning
    data.birth_planning.preferred_birth_place = "hospital".to_string();
    data.birth_planning.birth_preferences_discussed = "yes".to_string();
    data.birth_planning.pain_relief_preferences = "openToOptions".to_string();
    data.birth_planning.breastfeeding_intention = "breastfeeding".to_string();
    data.birth_planning.antenatal_classes_attended = "yes".to_string();
    data.birth_planning.birth_partner_identified = "yes".to_string();
    data.birth_planning.consent_for_interventions = "yes".to_string();
    data.birth_planning.vbac_discussion = "notApplicable".to_string();

    // Clinical Review - low risk
    data.clinical_review.overall_risk_assessment = Some(1);
    data.clinical_review.referral_to_consultant = "no".to_string();
    data.clinical_review.safeguarding_concerns = "no".to_string();
    data.clinical_review.additional_investigations = "none".to_string();
    data.clinical_review.follow_up_interval = "4weeks".to_string();
    data.clinical_review.clinical_notes = "Uncomplicated pregnancy. Continue routine care.".to_string();
    data.clinical_review.reviewed_by = "Midwife Jones".to_string();
    data.clinical_review.review_date = "2026-03-10".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_risk(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_low_risk_for_normal_pregnancy() {
    let data = create_low_risk_assessment();
    let (level, _score, _fired_rules) = calculate_risk(&data);
    assert_eq!(level, "lowRisk");
}

#[test]
fn returns_high_risk_for_severe_hypertension() {
    let mut data = create_low_risk_assessment();
    data.physical_examination.blood_pressure_systolic = Some(165);
    data.physical_examination.blood_pressure_diastolic = Some(115);

    let (level, _score, fired_rules) = calculate_risk(&data);
    assert!(level == "highRisk" || level == "urgent");
    assert!(fired_rules.iter().any(|r| r.id == "PRE-001"));
}

#[test]
fn fires_previous_stillbirth_rule() {
    let mut data = create_low_risk_assessment();
    data.obstetric_history.previous_stillbirth = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PRE-002"));
}

#[test]
fn fires_structural_abnormality_rule() {
    let mut data = create_low_risk_assessment();
    data.ultrasound_findings.structural_abnormalities = "detected".to_string();

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PRE-003"));
}

#[test]
fn fires_depression_rule_for_high_phq2() {
    let mut data = create_low_risk_assessment();
    data.mental_health_wellbeing.phq2_score = Some(5);

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PRE-004"));
}

#[test]
fn fires_multiple_pregnancy_rule() {
    let mut data = create_low_risk_assessment();
    data.current_pregnancy.pregnancy_type = "twins".to_string();

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PRE-010"));
}

#[test]
fn fires_anaemia_rule() {
    let mut data = create_low_risk_assessment();
    data.blood_tests.haemoglobin = Some(95.0);

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PRE-011"));
}

#[test]
fn fires_positive_rules_for_low_risk_pregnancy() {
    let data = create_low_risk_assessment();
    let (_level, _score, fired_rules) = calculate_risk(&data);

    // Should fire PRE-016 (no obstetric complications)
    assert!(fired_rules.iter().any(|r| r.id == "PRE-016"));
    // Should fire PRE-017 (no mental health concerns)
    assert!(fired_rules.iter().any(|r| r.id == "PRE-017"));
    // Should fire PRE-018 (normal BP)
    assert!(fired_rules.iter().any(|r| r.id == "PRE-018"));
    // Should fire PRE-019 (all screening normal)
    assert!(fired_rules.iter().any(|r| r.id == "PRE-019"));
    // Should fire PRE-020 (clinical risk low)
    assert!(fired_rules.iter().any(|r| r.id == "PRE-020"));
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
fn returns_urgent_for_multiple_high_concerns() {
    let mut data = create_low_risk_assessment();
    // Two high-concern triggers
    data.physical_examination.blood_pressure_systolic = Some(170);
    data.obstetric_history.previous_stillbirth = "yes".to_string();

    let (level, _score, fired_rules) = calculate_risk(&data);
    assert_eq!(level, "urgent");
    assert!(fired_rules.iter().filter(|r| r.concern_level == "high").count() >= 2);
}
