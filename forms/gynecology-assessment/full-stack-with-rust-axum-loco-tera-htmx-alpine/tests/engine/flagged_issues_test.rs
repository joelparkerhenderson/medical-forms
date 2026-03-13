use gynecology_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use gynecology_assessment_tera_crate::engine::types::*;

fn create_mild_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1985-06-15".to_string();

    data.menstrual_history.cycle_length = "21to35".to_string();
    data.menstrual_history.regularity = "regular".to_string();
    data.menstrual_history.intermenstrual_bleeding = "no".to_string();

    data.gynecological_symptoms.pelvic_pain_severity = Some(2);
    data.gynecological_symptoms.dysmenorrhoea = Some(2);
    data.gynecological_symptoms.dyspareunia = "no".to_string();
    data.gynecological_symptoms.abnormal_discharge = "no".to_string();
    data.gynecological_symptoms.urinary_symptoms = "no".to_string();
    data.gynecological_symptoms.prolapse_symptoms = "no".to_string();

    data.cervical_screening.smear_result = "normal".to_string();

    data.contraception_fertility.satisfaction = "satisfied".to_string();
    data.contraception_fertility.future_fertility_wishes = "no".to_string();
    data.contraception_fertility.fertility_concerns = "no".to_string();

    data.menopause_assessment.menopausal_status = "premenopausal".to_string();
    data.menopause_assessment.vasomotor_symptoms = Some(1);
    data.menopause_assessment.urogenital_symptoms = Some(1);
    data.menopause_assessment.mood_changes = Some(1);

    data.breast_health.breast_symptoms = "none".to_string();
    data.breast_health.family_breast_cancer = "no".to_string();

    data.sexual_health.current_concerns = "none".to_string();
    data.sexual_health.domestic_violence_screening = "no".to_string();
    data.sexual_health.fgm_assessment = "no".to_string();

    data.clinical_review.management_plan = "Continue current management".to_string();
    data.clinical_review.follow_up = "annual".to_string();

    data
}

#[test]
fn no_flags_for_mild_patient() {
    let data = create_mild_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_postmenopausal_bleeding() {
    let mut data = create_mild_assessment();
    data.menopause_assessment.menopausal_status = "postmenopausal".to_string();
    data.menstrual_history.intermenstrual_bleeding = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PMB-001"));
}

#[test]
fn flags_abnormal_cervical_screening() {
    let mut data = create_mild_assessment();
    data.cervical_screening.smear_result = "abnormal".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CERV-001"));
}

#[test]
fn flags_suspected_malignancy() {
    let mut data = create_mild_assessment();
    data.breast_health.breast_symptoms = "lump".to_string();
    data.breast_health.family_breast_cancer = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MALIG-001"));
}

#[test]
fn flags_severe_pelvic_pain() {
    let mut data = create_mild_assessment();
    data.gynecological_symptoms.pelvic_pain_severity = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PAIN-001"));
}

#[test]
fn flags_domestic_violence() {
    let mut data = create_mild_assessment();
    data.sexual_health.domestic_violence_screening = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-DV-001"));
}

#[test]
fn flags_fgm() {
    let mut data = create_mild_assessment();
    data.sexual_health.fgm_assessment = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-FGM-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_mild_assessment();
    // Create flags of different priorities
    data.gynecological_symptoms.pelvic_pain_severity = Some(5); // high
    data.gynecological_symptoms.prolapse_symptoms = "yes".to_string(); // medium
    data.contraception_fertility.satisfaction = "dissatisfied".to_string(); // low

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
