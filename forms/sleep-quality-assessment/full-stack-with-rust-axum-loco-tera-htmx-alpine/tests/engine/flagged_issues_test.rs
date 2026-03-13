use sleep_quality_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use sleep_quality_assessment_tera_crate::engine::types::*;

fn create_good_sleep_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.full_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1985-06-15".to_string();

    data.sleep_habits.bedtime = "22:30".to_string();
    data.sleep_habits.wake_time = "06:30".to_string();
    data.sleep_habits.sleep_latency_minutes = Some(15);
    data.sleep_habits.total_sleep_hours = Some(7.5);
    data.sleep_habits.sleep_efficiency = Some(90);

    data.sleep_quality_psqi.subjective_quality = Some(0);
    data.sleep_quality_psqi.sleep_latency = Some(0);
    data.sleep_quality_psqi.sleep_duration = Some(0);
    data.sleep_quality_psqi.sleep_efficiency_score = Some(0);
    data.sleep_quality_psqi.sleep_disturbances = Some(0);
    data.sleep_quality_psqi.sleep_medication = Some(0);
    data.sleep_quality_psqi.daytime_dysfunction = Some(0);

    data.daytime_sleepiness.ess_sitting = Some(0);
    data.daytime_sleepiness.ess_watching = Some(0);
    data.daytime_sleepiness.ess_sitting_inactive = Some(0);
    data.daytime_sleepiness.ess_passenger = Some(0);
    data.daytime_sleepiness.ess_lying_down = Some(0);
    data.daytime_sleepiness.ess_talking = Some(0);
    data.daytime_sleepiness.ess_after_lunch = Some(0);
    data.daytime_sleepiness.ess_traffic = Some(0);

    data.sleep_disturbances.difficulty_falling_asleep = Some(0);
    data.sleep_disturbances.night_wakings = Some(0);
    data.sleep_disturbances.leg_restlessness = Some(0);

    data.sleep_apnoea_screening.loud_snoring = "no".to_string();
    data.sleep_apnoea_screening.witnessed_apnoeas = "no".to_string();
    data.sleep_apnoea_screening.tiredness = "no".to_string();
    data.sleep_apnoea_screening.treated_hypertension = "no".to_string();
    data.sleep_apnoea_screening.bmi_over35 = "no".to_string();
    data.sleep_apnoea_screening.age_over50 = "no".to_string();
    data.sleep_apnoea_screening.neck_circumference_over40 = "no".to_string();
    data.sleep_apnoea_screening.male = "no".to_string();

    data.medical_medications.sleep_medications = "none".to_string();
    data.medical_medications.mental_health_condition = "no".to_string();
    data.medical_medications.chronic_pain_condition = "no".to_string();
    data.medical_medications.shift_work = "no".to_string();

    data.impact_assessment.driving_safety = Some(5);
    data.impact_assessment.accident_risk = "no".to_string();

    data
}

#[test]
fn no_flags_for_good_sleeper() {
    let data = create_good_sleep_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_witnessed_apnoeas() {
    let mut data = create_good_sleep_assessment();
    data.sleep_apnoea_screening.witnessed_apnoeas = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-APNOEA-002"));
}

#[test]
fn flags_high_stop_bang() {
    let mut data = create_good_sleep_assessment();
    data.sleep_apnoea_screening.loud_snoring = "yes".to_string();
    data.sleep_apnoea_screening.witnessed_apnoeas = "yes".to_string();
    data.sleep_apnoea_screening.tiredness = "yes".to_string();
    data.sleep_apnoea_screening.treated_hypertension = "yes".to_string();
    data.sleep_apnoea_screening.bmi_over35 = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-APNOEA-001"));
}

#[test]
fn flags_driving_safety_concern() {
    let mut data = create_good_sleep_assessment();
    data.impact_assessment.driving_safety = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-DRIVE-001"));
}

#[test]
fn flags_mental_health_comorbidity() {
    let mut data = create_good_sleep_assessment();
    data.medical_medications.mental_health_condition = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MOOD-001"));
}

#[test]
fn flags_chronic_pain() {
    let mut data = create_good_sleep_assessment();
    data.medical_medications.chronic_pain_condition = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PAIN-001"));
}

#[test]
fn flags_shift_work() {
    let mut data = create_good_sleep_assessment();
    data.medical_medications.shift_work = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-WORK-001"));
}

#[test]
fn flags_accident_risk() {
    let mut data = create_good_sleep_assessment();
    data.impact_assessment.accident_risk = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SAFETY-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_good_sleep_assessment();
    // Create flags of different priorities
    data.sleep_apnoea_screening.witnessed_apnoeas = "yes".to_string(); // high
    data.medical_medications.mental_health_condition = "yes".to_string(); // medium
    data.medical_medications.shift_work = "yes".to_string(); // medium
    data.impact_assessment.accident_risk = "yes".to_string(); // high

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
