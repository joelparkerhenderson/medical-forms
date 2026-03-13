use gynecology_assessment_tera_crate::engine::gynecology_grader::calculate_severity;
use gynecology_assessment_tera_crate::engine::gynecology_rules::all_rules;
use gynecology_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_mild_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1985-06-15".to_string();
    data.patient_information.nhs_number = "123 456 7890".to_string();
    data.patient_information.gp_name = "Dr Johnson".to_string();

    // Menstrual History
    data.menstrual_history.menarche_age = Some(12);
    data.menstrual_history.cycle_length = "21to35".to_string();
    data.menstrual_history.duration = "4to7".to_string();
    data.menstrual_history.regularity = "regular".to_string();
    data.menstrual_history.last_period = "2026-02-15".to_string();
    data.menstrual_history.flow_amount = "moderate".to_string();
    data.menstrual_history.intermenstrual_bleeding = "no".to_string();

    // Gynecological Symptoms - mild scores
    data.gynecological_symptoms.pelvic_pain_severity = Some(2);
    data.gynecological_symptoms.dysmenorrhoea = Some(2);
    data.gynecological_symptoms.dyspareunia = "no".to_string();
    data.gynecological_symptoms.abnormal_discharge = "no".to_string();
    data.gynecological_symptoms.urinary_symptoms = "no".to_string();
    data.gynecological_symptoms.prolapse_symptoms = "no".to_string();

    // Obstetric History
    data.obstetric_history.gravida = Some(2);
    data.obstetric_history.para = Some(2);
    data.obstetric_history.miscarriages = Some(0);
    data.obstetric_history.terminations = Some(0);
    data.obstetric_history.ectopic = Some(0);
    data.obstetric_history.delivery_modes = "vaginal".to_string();
    data.obstetric_history.complications = "".to_string();

    // Cervical Screening
    data.cervical_screening.last_smear_date = "2025-06-01".to_string();
    data.cervical_screening.smear_result = "normal".to_string();
    data.cervical_screening.hpv_status = "negative".to_string();
    data.cervical_screening.colposcopy_history = "none".to_string();

    // Contraception & Fertility
    data.contraception_fertility.current_method = "combinedPill".to_string();
    data.contraception_fertility.satisfaction = "satisfied".to_string();
    data.contraception_fertility.future_fertility_wishes = "no".to_string();
    data.contraception_fertility.fertility_concerns = "no".to_string();
    data.contraception_fertility.ivf_history = "none".to_string();

    // Menopause Assessment - mild scores
    data.menopause_assessment.menopausal_status = "premenopausal".to_string();
    data.menopause_assessment.vasomotor_symptoms = Some(1);
    data.menopause_assessment.urogenital_symptoms = Some(1);
    data.menopause_assessment.mood_changes = Some(1);
    data.menopause_assessment.hrt_use = "none".to_string();
    data.menopause_assessment.bone_health = "normal".to_string();

    // Breast Health
    data.breast_health.breast_symptoms = "none".to_string();
    data.breast_health.family_breast_cancer = "no".to_string();
    data.breast_health.brca_status = "notTested".to_string();

    // Sexual Health
    data.sexual_health.sti_screening = "upToDate".to_string();
    data.sexual_health.current_concerns = "none".to_string();
    data.sexual_health.domestic_violence_screening = "no".to_string();
    data.sexual_health.fgm_assessment = "no".to_string();

    // Clinical Review
    data.clinical_review.clinician_name = "Dr Williams".to_string();
    data.clinical_review.review_date = "2026-03-01".to_string();
    data.clinical_review.primary_diagnosis = "Routine gynecological assessment".to_string();
    data.clinical_review.management_plan = "Continue current management".to_string();
    data.clinical_review.referral_needed = "none".to_string();
    data.clinical_review.follow_up = "annual".to_string();

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
fn returns_mild_for_low_symptom_scores() {
    let data = create_mild_assessment();
    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "mild");
    assert_eq!(score, 10.0); // (avg 1.4 - 1) / 4 * 100 = 10
}

#[test]
fn returns_moderate_for_moderate_symptom_scores() {
    let mut data = create_mild_assessment();
    // Set Likert items to average 3.0 without triggering medium rules
    // GYN-006 fires for pelvic_pain 3-4, GYN-007 fires for dysmenorrhoea 4-5,
    // GYN-012 fires for vasomotor 4-5, so avoid those thresholds
    data.gynecological_symptoms.pelvic_pain_severity = Some(1);
    data.gynecological_symptoms.dysmenorrhoea = Some(3);
    data.menopause_assessment.vasomotor_symptoms = Some(3);
    data.menopause_assessment.urogenital_symptoms = Some(3);
    data.menopause_assessment.mood_changes = Some(5);

    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "moderate");
    assert_eq!(score, 50.0); // avg 3.0 => (3-1)/4 * 100 = 50
}

#[test]
fn returns_severe_for_high_symptom_scores() {
    let mut data = create_mild_assessment();
    // Set all Likert items to 4
    data.gynecological_symptoms.pelvic_pain_severity = Some(4);
    data.gynecological_symptoms.dysmenorrhoea = Some(4);
    data.menopause_assessment.vasomotor_symptoms = Some(4);
    data.menopause_assessment.urogenital_symptoms = Some(4);
    data.menopause_assessment.mood_changes = Some(4);

    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "severe");
    assert_eq!(score, 75.0); // (4-1)/4 * 100 = 75
}

#[test]
fn returns_urgent_for_high_concern_rules() {
    let mut data = create_mild_assessment();
    data.gynecological_symptoms.pelvic_pain_severity = Some(5);
    data.gynecological_symptoms.dysmenorrhoea = Some(2);
    data.menopause_assessment.vasomotor_symptoms = Some(2);
    data.menopause_assessment.urogenital_symptoms = Some(2);
    data.menopause_assessment.mood_changes = Some(2);

    let (level, _score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "urgent");
    assert!(fired_rules.iter().any(|r| r.id == "GYN-002")); // Severe pelvic pain
}

#[test]
fn fires_abnormal_cervical_screening_rule() {
    let mut data = create_mild_assessment();
    data.cervical_screening.smear_result = "abnormal".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GYN-004"));
}

#[test]
fn fires_domestic_violence_rule() {
    let mut data = create_mild_assessment();
    data.sexual_health.domestic_violence_screening = "yes".to_string();

    let (level, _score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "urgent");
    assert!(fired_rules.iter().any(|r| r.id == "GYN-005"));
}

#[test]
fn fires_postmenopausal_bleeding_rule() {
    let mut data = create_mild_assessment();
    data.menopause_assessment.menopausal_status = "postmenopausal".to_string();
    data.menstrual_history.intermenstrual_bleeding = "yes".to_string();

    let (level, _score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "urgent");
    assert!(fired_rules.iter().any(|r| r.id == "GYN-003"));
}

#[test]
fn fires_positive_rules_for_normal_screening() {
    let data = create_mild_assessment();
    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GYN-016")); // Cervical screening up to date
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
