use casualty_card_form_tera_crate::engine::types::{AssessmentData, VitalSigns};
use casualty_card_form_tera_crate::engine::news2_calculator::{calculate_news2, clinical_response};

fn data_with_vitals(vs: VitalSigns) -> AssessmentData {
    let mut d = AssessmentData::default();
    d.vital_signs = vs;
    d
}

#[test]
fn test_normal_vitals_score_zero() {
    let vs = VitalSigns {
        heart_rate: Some(75.0),
        systolic_bp: Some(120.0),
        respiratory_rate: Some(16.0),
        oxygen_saturation: Some(98.0),
        temperature: Some(37.0),
        consciousness_level: "alert".to_string(),
        supplemental_oxygen: "no".to_string(),
        ..Default::default()
    };
    let (score, rules) = calculate_news2(&data_with_vitals(vs));
    assert_eq!(score, 0);
    assert!(rules.is_empty());
}

#[test]
fn test_critical_vitals_max_score() {
    let vs = VitalSigns {
        heart_rate: Some(135.0),
        systolic_bp: Some(85.0),
        respiratory_rate: Some(26.0),
        oxygen_saturation: Some(90.0),
        temperature: Some(34.5),
        consciousness_level: "unresponsive".to_string(),
        supplemental_oxygen: "yes".to_string(),
        ..Default::default()
    };
    let (score, rules) = calculate_news2(&data_with_vitals(vs));
    assert_eq!(score, 20);
    assert_eq!(rules.len(), 7);
    assert_eq!(clinical_response(score, &rules), "High");
}

#[test]
fn test_medium_risk_score() {
    let vs = VitalSigns {
        heart_rate: Some(115.0),
        systolic_bp: Some(105.0),
        respiratory_rate: Some(22.0),
        oxygen_saturation: Some(97.0),
        temperature: Some(38.5),
        consciousness_level: "alert".to_string(),
        supplemental_oxygen: "no".to_string(),
        ..Default::default()
    };
    let (score, rules) = calculate_news2(&data_with_vitals(vs));
    assert_eq!(score, 6);
    assert_eq!(clinical_response(score, &rules), "Medium");
}

#[test]
fn test_single_param_3_low_medium() {
    let vs = VitalSigns {
        heart_rate: Some(75.0),
        systolic_bp: Some(120.0),
        respiratory_rate: Some(6.0),
        oxygen_saturation: Some(98.0),
        temperature: Some(37.0),
        consciousness_level: "alert".to_string(),
        supplemental_oxygen: "no".to_string(),
        ..Default::default()
    };
    let (score, rules) = calculate_news2(&data_with_vitals(vs));
    assert_eq!(score, 3);
    assert_eq!(clinical_response(score, &rules), "Low-Medium");
}

#[test]
fn test_low_risk() {
    let vs = VitalSigns {
        heart_rate: Some(95.0),
        systolic_bp: Some(120.0),
        respiratory_rate: Some(16.0),
        oxygen_saturation: Some(94.0),
        temperature: Some(37.0),
        consciousness_level: "alert".to_string(),
        supplemental_oxygen: "no".to_string(),
        ..Default::default()
    };
    let (score, rules) = calculate_news2(&data_with_vitals(vs));
    assert_eq!(score, 2);
    assert_eq!(clinical_response(score, &rules), "Low");
}
