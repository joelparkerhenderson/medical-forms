use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Step titles used in the progress indicator and page headings.
const STEP_TITLES: &[&str] = &[
    "Patient Information",
    "Demographics & Ethnicity",
    "Blood Pressure",
    "Cholesterol",
    "Medical Conditions",
    "Family History",
    "Smoking & Alcohol",
    "Physical Activity & Diet",
    "Body Measurements",
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
    context.insert("demographics_ethnicity", &data.demographics_ethnicity);
    context.insert("blood_pressure", &data.blood_pressure);
    context.insert("cholesterol", &data.cholesterol);
    context.insert("medical_conditions", &data.medical_conditions);
    context.insert("family_history", &data.family_history);
    context.insert("smoking_alcohol", &data.smoking_alcohol);
    context.insert("physical_activity_diet", &data.physical_activity_diet);
    context.insert("body_measurements", &data.body_measurements);
    context.insert("review_calculate", &data.review_calculate);

    context
}
