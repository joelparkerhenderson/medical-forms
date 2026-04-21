use chrono::{Datelike, NaiveDate, Utc};

/// Calculate BMI from weight (kg) and height (cm). Returns None if inputs are invalid.
pub fn calculate_bmi(weight_kg: Option<f64>, height_cm: Option<f64>) -> Option<f64> {
    match (weight_kg, height_cm) {
        (Some(w), Some(h)) if w > 0.0 && h > 0.0 => {
            let height_m = h / 100.0;
            Some(((w / (height_m * height_m)) * 10.0).round() / 10.0)
        }
        _ => None,
    }
}

/// Estimate METs from exercise tolerance category.
pub fn estimate_mets(tolerance: &str) -> Option<f64> {
    match tolerance {
        "unable" => Some(1.0),
        "light-housework" => Some(2.0),
        "climb-stairs" => Some(4.0),
        "moderate-exercise" => Some(7.0),
        "vigorous-exercise" => Some(10.0),
        _ => None,
    }
}

/// Get BMI category label.
pub fn bmi_category(bmi: Option<f64>) -> &'static str {
    match bmi {
        None => "",
        Some(b) if b < 18.5 => "Underweight",
        Some(b) if b < 25.0 => "Normal",
        Some(b) if b < 30.0 => "Overweight",
        Some(b) if b < 35.0 => "Obese Class I",
        Some(b) if b < 40.0 => "Obese Class II",
        Some(_) => "Obese Class III (Morbid)",
    }
}

/// Calculate age from date of birth string (YYYY-MM-DD).
pub fn calculate_age(dob: &str) -> Option<i32> {
    if dob.is_empty() {
        return None;
    }
    let birth = NaiveDate::parse_from_str(dob, "%Y-%m-%d").ok()?;
    let today = Utc::now().date_naive();
    let mut age = today.year() - birth.year();
    if today.month() < birth.month()
        || (today.month() == birth.month() && today.day() < birth.day())
    {
        age -= 1;
    }
    Some(age)
}

/// ASA grade label.
pub fn asa_grade_label(grade: u8) -> String {
    match grade {
        1 => "ASA I - Healthy".to_string(),
        2 => "ASA II - Mild Systemic Disease".to_string(),
        3 => "ASA III - Severe Systemic Disease".to_string(),
        4 => "ASA IV - Life-Threatening Disease".to_string(),
        5 => "ASA V - Moribund".to_string(),
        _ => format!("ASA {grade}"),
    }
}
