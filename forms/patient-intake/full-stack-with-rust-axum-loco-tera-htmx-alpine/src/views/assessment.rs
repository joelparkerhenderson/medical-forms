use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Step titles used in the progress indicator and page headings.
const STEP_TITLES: &[&str] = &[
    "Personal Information",
    "Insurance & ID",
    "Reason for Visit",
    "Medical History",
    "Current Medications",
    "Allergies",
    "Family History",
    "Social History",
    "Review of Systems",
    "Consent & Preferences",
];

/// Total number of steps (always 10, all visible).
pub const TOTAL_STEPS: u32 = 10;

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
    context.insert("personal_information", &data.personal_information);
    context.insert("insurance_and_id", &data.insurance_and_id);
    context.insert("reason_for_visit", &data.reason_for_visit);
    context.insert("medical_history", &data.medical_history);
    context.insert("medications", &data.medications);
    context.insert("allergies", &data.allergies);
    context.insert("family_history", &data.family_history);
    context.insert("social_history", &data.social_history);
    context.insert("review_of_systems", &data.review_of_systems);
    context.insert("consent_and_preferences", &data.consent_and_preferences);

    context
}
