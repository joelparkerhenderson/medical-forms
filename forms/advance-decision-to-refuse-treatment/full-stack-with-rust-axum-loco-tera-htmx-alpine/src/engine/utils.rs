use chrono::{Datelike, NaiveDate, Utc};

use super::types::AssessmentData;

/// Validity status display label.
pub fn validity_status_label(status: &str) -> String {
    match status {
        "draft" => "Draft - In Progress".to_string(),
        "complete" => "Complete - All Sections Filled".to_string(),
        "valid" => "Valid - Legally Compliant".to_string(),
        "invalid" => "Invalid - Missing Legal Requirements".to_string(),
        _ => format!("Status: {status}"),
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

/// Check whether any life-sustaining treatment has been refused.
pub fn has_life_sustaining_refusal(data: &AssessmentData) -> bool {
    let ls = &data.treatments_refused_life_sustaining;
    if ls.cpr.refused == "yes" {
        return true;
    }
    if ls.mechanical_ventilation.refused == "yes" {
        return true;
    }
    if ls.artificial_nutrition_hydration.refused == "yes" {
        return true;
    }
    if ls.other_life_sustaining.iter().any(|t| t.refused == "yes") {
        return true;
    }
    false
}
