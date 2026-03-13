use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Step titles used in the progress indicator and page headings.
const STEP_TITLES: &[&str] = &[
    "Patient Information",
    "Demographics",
    "Smoking History",
    "Blood Pressure",
    "Cholesterol",
    "Medical History",
    "Family History",
    "Lifestyle Factors",
    "Current Medications",
    "Review & Calculate",
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
    context.insert("demographics", &data.demographics);
    context.insert("smoking_history", &data.smoking_history);
    context.insert("blood_pressure", &data.blood_pressure);
    context.insert("cholesterol", &data.cholesterol);
    context.insert("medical_history", &data.medical_history);
    context.insert("family_history", &data.family_history);
    context.insert("lifestyle_factors", &data.lifestyle_factors);
    context.insert("current_medications", &data.current_medications);
    context.insert("review_calculate", &data.review_calculate);

    context
}
