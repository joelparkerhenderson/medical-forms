use chrono::{Datelike, NaiveDate, Utc};

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

/// Risk level label.
pub fn risk_level_label(level: &str) -> String {
    match level {
        "low" => "Low Risk - Healthy, minimal risk factors".to_string(),
        "medium" => "Medium Risk - Controlled chronic conditions, some risk factors".to_string(),
        "high" => "High Risk - Uncontrolled conditions, multiple comorbidities".to_string(),
        _ => format!("Risk: {level}"),
    }
}
