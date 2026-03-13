use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Step titles used in the progress indicator and page headings.
const STEP_TITLES: &[&str] = &[
    "Patient Information",
    "Movement History",
    "Postural Assessment",
    "Range of Motion",
    "Muscle Strength Testing",
    "Gait Analysis",
    "Functional Testing",
    "Pain Assessment",
    "Exercise Prescription",
    "Clinical Review",
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
    context.insert("movement_history", &data.movement_history);
    context.insert("postural_assessment", &data.postural_assessment);
    context.insert("range_of_motion", &data.range_of_motion);
    context.insert("muscle_strength_testing", &data.muscle_strength_testing);
    context.insert("gait_analysis", &data.gait_analysis);
    context.insert("functional_testing", &data.functional_testing);
    context.insert("pain_assessment", &data.pain_assessment);
    context.insert("exercise_prescription", &data.exercise_prescription);
    context.insert("clinical_review", &data.clinical_review);

    context
}
