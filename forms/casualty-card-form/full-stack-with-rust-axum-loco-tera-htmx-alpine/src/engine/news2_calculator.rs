use crate::engine::types::{AssessmentData, FiredRule, News2Score};

/// Calculate NEWS2 score from vital signs.
/// Returns (total_score, vec_of_fired_rules).
pub fn calculate_news2(data: &AssessmentData) -> (News2Score, Vec<FiredRule>) {
    let vs = &data.vital_signs;
    let mut total: u8 = 0;
    let mut rules = Vec::new();

    // Respiratory rate
    if let Some(rr) = vs.respiratory_rate {
        let score = score_respiratory_rate(rr);
        if score > 0 {
            rules.push(FiredRule {
                id: format!("NEWS2-RR-{score}"),
                parameter: "Respiratory Rate".to_string(),
                description: format!("RR {rr}/min scores {score}"),
                score,
            });
        }
        total = total.saturating_add(score);
    }

    // SpO2 Scale 1 (default)
    if let Some(spo2) = vs.oxygen_saturation {
        let score = score_spo2_scale1(spo2);
        if score > 0 {
            rules.push(FiredRule {
                id: format!("NEWS2-SpO2-{score}"),
                parameter: "Oxygen Saturation".to_string(),
                description: format!("SpO2 {spo2}% scores {score}"),
                score,
            });
        }
        total = total.saturating_add(score);
    }

    // Systolic BP
    if let Some(sbp) = vs.systolic_bp {
        let score = score_systolic_bp(sbp);
        if score > 0 {
            rules.push(FiredRule {
                id: format!("NEWS2-SBP-{score}"),
                parameter: "Systolic Blood Pressure".to_string(),
                description: format!("Systolic BP {sbp} mmHg scores {score}"),
                score,
            });
        }
        total = total.saturating_add(score);
    }

    // Heart rate
    if let Some(hr) = vs.heart_rate {
        let score = score_heart_rate(hr);
        if score > 0 {
            rules.push(FiredRule {
                id: format!("NEWS2-HR-{score}"),
                parameter: "Heart Rate".to_string(),
                description: format!("HR {hr} bpm scores {score}"),
                score,
            });
        }
        total = total.saturating_add(score);
    }

    // Consciousness level
    let consciousness_score = score_consciousness(&vs.consciousness_level);
    if consciousness_score > 0 {
        rules.push(FiredRule {
            id: format!("NEWS2-AVPU-{consciousness_score}"),
            parameter: "Consciousness".to_string(),
            description: format!("Consciousness '{}' scores {consciousness_score}", vs.consciousness_level),
            score: consciousness_score,
        });
    }
    total = total.saturating_add(consciousness_score);

    // Temperature
    if let Some(temp) = vs.temperature {
        let score = score_temperature(temp);
        if score > 0 {
            rules.push(FiredRule {
                id: format!("NEWS2-Temp-{score}"),
                parameter: "Temperature".to_string(),
                description: format!("Temp {temp}°C scores {score}"),
                score,
            });
        }
        total = total.saturating_add(score);
    }

    // Supplemental oxygen
    let supp_o2_score = if vs.supplemental_oxygen == "yes" { 2 } else { 0 };
    if supp_o2_score > 0 {
        rules.push(FiredRule {
            id: "NEWS2-O2Supp-2".to_string(),
            parameter: "Supplemental Oxygen".to_string(),
            description: "On supplemental oxygen scores 2".to_string(),
            score: supp_o2_score,
        });
    }
    total = total.saturating_add(supp_o2_score);

    (total, rules)
}

/// Determine clinical response level from NEWS2 score and individual parameter scores.
pub fn clinical_response(total: News2Score, rules: &[FiredRule]) -> String {
    if total >= 7 {
        return "High".to_string();
    }
    // Check if any single parameter scored 3
    if rules.iter().any(|r| r.score >= 3) {
        if total >= 5 {
            return "Medium".to_string();
        }
        return "Low-Medium".to_string();
    }
    if total >= 5 {
        "Medium".to_string()
    } else {
        "Low".to_string()
    }
}

fn score_respiratory_rate(rr: f64) -> u8 {
    if rr <= 8.0 { 3 }
    else if rr <= 11.0 { 1 }
    else if rr <= 20.0 { 0 }
    else if rr <= 24.0 { 2 }
    else { 3 }
}

fn score_spo2_scale1(spo2: f64) -> u8 {
    if spo2 <= 91.0 { 3 }
    else if spo2 <= 93.0 { 2 }
    else if spo2 <= 95.0 { 1 }
    else { 0 }
}

fn score_systolic_bp(sbp: f64) -> u8 {
    if sbp <= 90.0 { 3 }
    else if sbp <= 100.0 { 2 }
    else if sbp <= 110.0 { 1 }
    else if sbp <= 219.0 { 0 }
    else { 3 }
}

fn score_heart_rate(hr: f64) -> u8 {
    if hr <= 40.0 { 3 }
    else if hr <= 50.0 { 1 }
    else if hr <= 90.0 { 0 }
    else if hr <= 110.0 { 1 }
    else if hr <= 130.0 { 2 }
    else { 3 }
}

fn score_consciousness(level: &str) -> u8 {
    match level.to_lowercase().as_str() {
        "alert" | "" => 0,
        _ => 3, // confusion, voice, pain, unresponsive all score 3
    }
}

fn score_temperature(temp: f64) -> u8 {
    if temp <= 35.0 { 3 }
    else if temp <= 36.0 { 1 }
    else if temp <= 38.0 { 0 }
    else if temp <= 39.0 { 1 }
    else { 2 }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::engine::types::VitalSigns;

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
    fn test_critical_vitals_high_score() {
        let vs = VitalSigns {
            heart_rate: Some(135.0),     // 3
            systolic_bp: Some(85.0),     // 3
            respiratory_rate: Some(26.0), // 3
            oxygen_saturation: Some(90.0), // 3
            temperature: Some(34.5),      // 3
            consciousness_level: "unresponsive".to_string(), // 3
            supplemental_oxygen: "yes".to_string(), // 2
            ..Default::default()
        };
        let (score, rules) = calculate_news2(&data_with_vitals(vs));
        assert_eq!(score, 20);
        assert_eq!(rules.len(), 7);
    }

    #[test]
    fn test_medium_score() {
        let vs = VitalSigns {
            heart_rate: Some(115.0),     // 2
            systolic_bp: Some(105.0),    // 1
            respiratory_rate: Some(22.0), // 2
            oxygen_saturation: Some(97.0), // 0
            temperature: Some(38.5),      // 1
            consciousness_level: "alert".to_string(), // 0
            supplemental_oxygen: "no".to_string(), // 0
            ..Default::default()
        };
        let (score, rules) = calculate_news2(&data_with_vitals(vs));
        assert_eq!(score, 6);
        assert_eq!(clinical_response(score, &rules), "Medium");
    }

    #[test]
    fn test_single_param_3_triggers_low_medium() {
        let vs = VitalSigns {
            heart_rate: Some(75.0),       // 0
            systolic_bp: Some(120.0),     // 0
            respiratory_rate: Some(6.0),  // 3 (single param = 3)
            oxygen_saturation: Some(98.0), // 0
            temperature: Some(37.0),       // 0
            consciousness_level: "alert".to_string(), // 0
            supplemental_oxygen: "no".to_string(), // 0
            ..Default::default()
        };
        let (score, rules) = calculate_news2(&data_with_vitals(vs));
        assert_eq!(score, 3);
        assert_eq!(clinical_response(score, &rules), "Low-Medium");
    }

    #[test]
    fn test_high_response_threshold() {
        let vs = VitalSigns {
            heart_rate: Some(135.0),      // 3
            systolic_bp: Some(85.0),      // 3
            respiratory_rate: Some(16.0), // 0
            oxygen_saturation: Some(98.0), // 0
            temperature: Some(37.0),       // 0
            consciousness_level: "pain".to_string(), // 3
            supplemental_oxygen: "no".to_string(), // 0
            ..Default::default()
        };
        let (score, rules) = calculate_news2(&data_with_vitals(vs));
        assert_eq!(score, 9);
        assert_eq!(clinical_response(score, &rules), "High");
    }
}
