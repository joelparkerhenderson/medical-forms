use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Step titles used in the progress indicator and page headings.
const STEP_TITLES: &[&str] = &[
    "Patient Information",
    "Personal Values & Beliefs",
    "Care Preferences",
    "Communication Preferences",
    "Daily Living Preferences",
    "Spiritual & Cultural Wishes",
    "Nominated Persons",
    "End of Life Preferences",
    "Healthcare Professional Review",
    "Signatures & Verification",
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
    context.insert("patient_information", &data.patient_information);
    context.insert("personal_values", &data.personal_values);
    context.insert("care_preferences", &data.care_preferences);
    context.insert("communication_preferences", &data.communication_preferences);
    context.insert("daily_living_preferences", &data.daily_living_preferences);
    context.insert("spiritual_cultural", &data.spiritual_cultural);
    context.insert("nominated_persons", &data.nominated_persons);
    context.insert("end_of_life_preferences", &data.end_of_life_preferences);
    context.insert("healthcare_professional_review", &data.healthcare_professional_review);
    context.insert("signatures_verification", &data.signatures_verification);

    context
}
