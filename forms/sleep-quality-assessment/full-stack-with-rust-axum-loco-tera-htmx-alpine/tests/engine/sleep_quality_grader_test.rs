use sleep_quality_assessment_tera_crate::engine::sleep_quality_grader::calculate_sleep_quality;
use sleep_quality_assessment_tera_crate::engine::sleep_quality_rules::all_rules;
use sleep_quality_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_good_sleep_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.full_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1985-06-15".to_string();
    data.patient_information.nhs_number = "943 476 5919".to_string();
    data.patient_information.gp_name = "Dr Jones".to_string();
    data.patient_information.gp_practice = "Riverside Medical Centre".to_string();

    // Sleep Habits
    data.sleep_habits.bedtime = "22:30".to_string();
    data.sleep_habits.wake_time = "06:30".to_string();
    data.sleep_habits.sleep_latency_minutes = Some(15);
    data.sleep_habits.total_sleep_hours = Some(7.5);
    data.sleep_habits.sleep_efficiency = Some(90);
    data.sleep_habits.naps_per_day = Some(0);
    data.sleep_habits.weekend_sleep_difference = "none".to_string();

    // PSQI components - all 0 (best) = total 0
    data.sleep_quality_psqi.subjective_quality = Some(0);
    data.sleep_quality_psqi.sleep_latency = Some(0);
    data.sleep_quality_psqi.sleep_duration = Some(0);
    data.sleep_quality_psqi.sleep_efficiency_score = Some(0);
    data.sleep_quality_psqi.sleep_disturbances = Some(0);
    data.sleep_quality_psqi.sleep_medication = Some(0);
    data.sleep_quality_psqi.daytime_dysfunction = Some(0);

    // ESS - all 0 (no sleepiness) = total 0
    data.daytime_sleepiness.ess_sitting = Some(0);
    data.daytime_sleepiness.ess_watching = Some(0);
    data.daytime_sleepiness.ess_sitting_inactive = Some(0);
    data.daytime_sleepiness.ess_passenger = Some(0);
    data.daytime_sleepiness.ess_lying_down = Some(0);
    data.daytime_sleepiness.ess_talking = Some(0);
    data.daytime_sleepiness.ess_after_lunch = Some(0);
    data.daytime_sleepiness.ess_traffic = Some(0);

    // Sleep Disturbances - all 0
    data.sleep_disturbances.difficulty_falling_asleep = Some(0);
    data.sleep_disturbances.night_wakings = Some(0);
    data.sleep_disturbances.early_morning_waking = Some(0);
    data.sleep_disturbances.nightmares = Some(0);
    data.sleep_disturbances.leg_restlessness = Some(0);
    data.sleep_disturbances.snoring = Some(0);
    data.sleep_disturbances.breathing_pauses = Some(0);
    data.sleep_disturbances.pain_disturbance = Some(0);

    // Sleep Apnoea Screening - all no
    data.sleep_apnoea_screening.loud_snoring = "no".to_string();
    data.sleep_apnoea_screening.witnessed_apnoeas = "no".to_string();
    data.sleep_apnoea_screening.tiredness = "no".to_string();
    data.sleep_apnoea_screening.treated_hypertension = "no".to_string();
    data.sleep_apnoea_screening.bmi_over35 = "no".to_string();
    data.sleep_apnoea_screening.age_over50 = "no".to_string();
    data.sleep_apnoea_screening.neck_circumference_over40 = "no".to_string();
    data.sleep_apnoea_screening.male = "no".to_string();

    // Sleep Hygiene - good
    data.sleep_hygiene.regular_schedule = "yes".to_string();
    data.sleep_hygiene.screen_time_before_bed = "none".to_string();
    data.sleep_hygiene.caffeine_late_use = "no".to_string();
    data.sleep_hygiene.alcohol_before_bed = "no".to_string();
    data.sleep_hygiene.exercise_timing = "morning".to_string();
    data.sleep_hygiene.bedroom_environment = Some(5);
    data.sleep_hygiene.bed_used_for_sleep_only = "yes".to_string();
    data.sleep_hygiene.relaxation_technique = "yes".to_string();

    // Medical & Medications
    data.medical_medications.sleep_medications = "none".to_string();
    data.medical_medications.medication_duration = "notApplicable".to_string();
    data.medical_medications.mental_health_condition = "no".to_string();
    data.medical_medications.chronic_pain_condition = "no".to_string();
    data.medical_medications.respiratory_condition = "no".to_string();
    data.medical_medications.shift_work = "no".to_string();

    // Impact Assessment - not affected (all 5)
    data.impact_assessment.work_performance = Some(5);
    data.impact_assessment.driving_safety = Some(5);
    data.impact_assessment.social_functioning = Some(5);
    data.impact_assessment.mood_impact = Some(5);
    data.impact_assessment.concentration_impact = Some(5);
    data.impact_assessment.accident_risk = "no".to_string();
    data.impact_assessment.quality_of_life = Some(5);

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, psqi, ess, stop_bang, fired_rules) = calculate_sleep_quality(&data);
    assert_eq!(level, "draft");
    assert_eq!(psqi, 0);
    assert_eq!(ess, 0);
    assert_eq!(stop_bang, 0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_good_for_best_scores() {
    let data = create_good_sleep_assessment();
    let (level, psqi, ess, stop_bang, _fired_rules) = calculate_sleep_quality(&data);
    assert_eq!(level, "good");
    assert_eq!(psqi, 0); // All components 0
    assert_eq!(ess, 0); // All ESS items 0
    assert_eq!(stop_bang, 0); // All STOP-BANG answers "no"
}

#[test]
fn returns_very_poor_for_worst_psqi() {
    let mut data = create_good_sleep_assessment();
    // Set all PSQI components to 3 = total 21
    data.sleep_quality_psqi.subjective_quality = Some(3);
    data.sleep_quality_psqi.sleep_latency = Some(3);
    data.sleep_quality_psqi.sleep_duration = Some(3);
    data.sleep_quality_psqi.sleep_efficiency_score = Some(3);
    data.sleep_quality_psqi.sleep_disturbances = Some(3);
    data.sleep_quality_psqi.sleep_medication = Some(3);
    data.sleep_quality_psqi.daytime_dysfunction = Some(3);

    let (level, psqi, _ess, _stop_bang, fired_rules) = calculate_sleep_quality(&data);
    assert_eq!(level, "veryPoor");
    assert_eq!(psqi, 21);
    assert!(fired_rules.iter().any(|r| r.id == "SLP-001")); // PSQI > 15
}

#[test]
fn returns_fair_for_moderate_psqi() {
    let mut data = create_good_sleep_assessment();
    // Set PSQI to moderate score: total 8
    data.sleep_quality_psqi.subjective_quality = Some(1);
    data.sleep_quality_psqi.sleep_latency = Some(1);
    data.sleep_quality_psqi.sleep_duration = Some(1);
    data.sleep_quality_psqi.sleep_efficiency_score = Some(1);
    data.sleep_quality_psqi.sleep_disturbances = Some(1);
    data.sleep_quality_psqi.sleep_medication = Some(1);
    data.sleep_quality_psqi.daytime_dysfunction = Some(2);

    let (level, psqi, _ess, _stop_bang, _fired_rules) = calculate_sleep_quality(&data);
    assert_eq!(level, "fair");
    assert_eq!(psqi, 8); // 6*1 + 2 = 8, which is 6-10 range
}

#[test]
fn returns_poor_for_high_psqi() {
    let mut data = create_good_sleep_assessment();
    // Set PSQI to poor score: total 13
    data.sleep_quality_psqi.subjective_quality = Some(2);
    data.sleep_quality_psqi.sleep_latency = Some(2);
    data.sleep_quality_psqi.sleep_duration = Some(2);
    data.sleep_quality_psqi.sleep_efficiency_score = Some(2);
    data.sleep_quality_psqi.sleep_disturbances = Some(2);
    data.sleep_quality_psqi.sleep_medication = Some(2);
    data.sleep_quality_psqi.daytime_dysfunction = Some(1);

    let (level, psqi, _ess, _stop_bang, fired_rules) = calculate_sleep_quality(&data);
    assert_eq!(level, "poor");
    assert_eq!(psqi, 13); // 6*2 + 1 = 13, which is 11-15 range
    assert!(fired_rules.iter().any(|r| r.id == "SLP-006")); // PSQI 11-15
}

#[test]
fn fires_severe_ess_rule() {
    let mut data = create_good_sleep_assessment();
    // Set ESS to severe: all 3s = total 24
    data.daytime_sleepiness.ess_sitting = Some(3);
    data.daytime_sleepiness.ess_watching = Some(3);
    data.daytime_sleepiness.ess_sitting_inactive = Some(3);
    data.daytime_sleepiness.ess_passenger = Some(3);
    data.daytime_sleepiness.ess_lying_down = Some(3);
    data.daytime_sleepiness.ess_talking = Some(3);
    data.daytime_sleepiness.ess_after_lunch = Some(3);
    data.daytime_sleepiness.ess_traffic = Some(3);

    let (_level, _psqi, ess, _stop_bang, fired_rules) = calculate_sleep_quality(&data);
    assert_eq!(ess, 24);
    assert!(fired_rules.iter().any(|r| r.id == "SLP-002")); // ESS >= 16
}

#[test]
fn fires_high_stop_bang_rule() {
    let mut data = create_good_sleep_assessment();
    // Set STOP-BANG to high risk: 6 yes answers
    data.sleep_apnoea_screening.loud_snoring = "yes".to_string();
    data.sleep_apnoea_screening.witnessed_apnoeas = "yes".to_string();
    data.sleep_apnoea_screening.tiredness = "yes".to_string();
    data.sleep_apnoea_screening.treated_hypertension = "yes".to_string();
    data.sleep_apnoea_screening.bmi_over35 = "yes".to_string();
    data.sleep_apnoea_screening.male = "yes".to_string();

    let (_level, _psqi, _ess, stop_bang, fired_rules) = calculate_sleep_quality(&data);
    assert_eq!(stop_bang, 6);
    assert!(fired_rules.iter().any(|r| r.id == "SLP-003")); // STOP-BANG >= 5
    assert!(fired_rules.iter().any(|r| r.id == "SLP-004")); // Witnessed apnoeas + snoring
}

#[test]
fn fires_driving_safety_rule() {
    let mut data = create_good_sleep_assessment();
    data.impact_assessment.driving_safety = Some(1);

    let (_level, _psqi, _ess, _stop_bang, fired_rules) = calculate_sleep_quality(&data);
    assert!(fired_rules.iter().any(|r| r.id == "SLP-005")); // Driving safety <= 2
}

#[test]
fn fires_good_sleep_hygiene_rule() {
    let data = create_good_sleep_assessment();
    let (_level, _psqi, _ess, _stop_bang, fired_rules) = calculate_sleep_quality(&data);
    assert!(fired_rules.iter().any(|r| r.id == "SLP-018")); // Good sleep hygiene
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
