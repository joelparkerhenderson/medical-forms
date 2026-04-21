use chrono::Datelike;
use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Step titles used in the progress indicator and page headings.
const STEP_TITLES: &[&str] = &[
    "Demographics",
    "Cardiovascular",
    "Respiratory",
    "Renal",
    "Hepatic",
    "Endocrine",
    "Neurological",
    "Haematological",
    "Musculoskeletal & Airway",
    "Gastrointestinal",
    "Medications",
    "Allergies",
    "Previous Anaesthesia",
    "Social History",
    "Functional Capacity",
    "Pregnancy",
];

/// Total number of steps (always 16, but step 16 may be skipped).
pub const TOTAL_STEPS: u32 = 16;

/// Build a Tera context for rendering a step form template.
pub fn build_step_context(data: &AssessmentData, id: Uuid, step: u32) -> Context {
    let mut context = Context::new();

    context.insert("id", &id.to_string());
    context.insert("step", &step);
    context.insert("total_steps", &TOTAL_STEPS);
    context.insert("step_title", STEP_TITLES.get((step as usize).wrapping_sub(1)).unwrap_or(&""));

    // Progress percentage
    let progress = ((step as f64 / TOTAL_STEPS as f64) * 100.0) as u32;
    context.insert("progress", &progress);

    // Navigation
    let prev_step = if step > 1 { Some(step - 1) } else { None };
    let next_step = if step < TOTAL_STEPS { Some(step + 1) } else { None };
    context.insert("prev_step", &prev_step);
    context.insert("next_step", &next_step);

    // Insert all data sections so templates can reference them
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

    // Step 16 visibility: only show if sex=female and age 12-55
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
