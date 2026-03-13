use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Step titles used in the progress indicator and page headings.
const STEP_TITLES: &[&str] = &[
    "Visit Information",
    "Wait Time & Access",
    "Communication",
    "Care Quality",
    "Staff Interaction",
    "Environment",
    "Medication & Treatment",
    "Discharge & Follow-up",
    "Overall Experience",
    "Demographics & Comments",
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
    context.insert("visit_information", &data.visit_information);
    context.insert("wait_time_access", &data.wait_time_access);
    context.insert("communication", &data.communication);
    context.insert("care_quality", &data.care_quality);
    context.insert("staff_interaction", &data.staff_interaction);
    context.insert("environment", &data.environment);
    context.insert("medication_treatment", &data.medication_treatment);
    context.insert("discharge_follow_up", &data.discharge_follow_up);
    context.insert("overall_experience", &data.overall_experience);
    context.insert("demographics_comments", &data.demographics_comments);

    context
}
