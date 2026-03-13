use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Step titles used in the progress indicator and page headings.
const STEP_TITLES: &[&str] = &[
    "Patient Information",
    "Asthma History",
    "Symptom Assessment",
    "Lung Function",
    "Triggers & Exacerbations",
    "Current Medications",
    "Inhaler Technique",
    "Comorbidities",
    "Lifestyle & Environment",
    "Review & Management Plan",
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
    context.insert("asthma_history", &data.asthma_history);
    context.insert("symptom_assessment", &data.symptom_assessment);
    context.insert("lung_function", &data.lung_function);
    context.insert("triggers_exacerbations", &data.triggers_exacerbations);
    context.insert("current_medications", &data.current_medications);
    context.insert("inhaler_technique", &data.inhaler_technique);
    context.insert("comorbidities", &data.comorbidities);
    context.insert("lifestyle_environment", &data.lifestyle_environment);
    context.insert("review_management_plan", &data.review_management_plan);

    context
}
