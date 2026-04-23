use chrono::Datelike;
use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Total number of assessment sections. Step 16 (pregnancy) is hidden for
/// non-applicable patients, but the count is always 16.
pub const TOTAL_STEPS: u32 = 16;

/// Build a Tera context for rendering the single-page assessment form.
/// All 16 section partials share the same context.
pub fn build_assessment_context(data: &AssessmentData, id: Uuid) -> Context {
    let mut context = Context::new();

    context.insert("id", &id.to_string());
    context.insert("total_steps", &TOTAL_STEPS);

    // All data sections keyed by snake_case to match the step partials.
    context.insert("data", &data);
    context.insert("demographics", &data.demographics);
    context.insert("cardiovascular", &data.cardiovascular);
    context.insert("respiratory", &data.respiratory);
    context.insert("renal", &data.renal);
    context.insert("hepatic", &data.hepatic);
    context.insert("endocrine", &data.endocrine);
    context.insert("neurological", &data.neurological);
    context.insert("haematological", &data.haematological);
    context.insert("musculoskeletal_airway", &data.musculoskeletal_airway);
    context.insert("gastrointestinal", &data.gastrointestinal);
    context.insert("medications", &data.medications);
    context.insert("allergies", &data.allergies);
    context.insert("previous_anaesthesia", &data.previous_anaesthesia);
    context.insert("social_history", &data.social_history);
    context.insert("functional_capacity", &data.functional_capacity);
    context.insert("pregnancy", &data.pregnancy);

    // Pregnancy section visibility: only when sex=female and age 12–55.
    let show_pregnancy = is_pregnancy_applicable(data);
    context.insert("show_pregnancy", &show_pregnancy);

    context
}

/// Determine if pregnancy step should be shown.
fn is_pregnancy_applicable(data: &AssessmentData) -> bool {
    if data.demographics.sex != "female" {
        return false;
    }
    if data.demographics.date_of_birth.is_empty() {
        return true; // Show by default for female if age unknown
    }
    // Calculate age
    if let Ok(dob) = chrono::NaiveDate::parse_from_str(&data.demographics.date_of_birth, "%Y-%m-%d") {
        let today = chrono::Utc::now().date_naive();
        let age = today.year() - dob.year()
            - if today.ordinal() < dob.ordinal() { 1 } else { 0 };
        (12..=55).contains(&age)
    } else {
        true
    }
}
