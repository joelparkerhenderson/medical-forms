use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Step titles used in the progress indicator and page headings.
const STEP_TITLES: &[&str] = &[
    "Patient Information",
    "Skin History",
    "Current Condition",
    "Affected Areas",
    "Symptom Severity",
    "Quality of Life (DLQI)",
    "Previous Treatments",
    "Current Treatment",
    "Triggers & Comorbidities",
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
    context.insert("skin_history", &data.skin_history);
    context.insert("current_condition", &data.current_condition);
    context.insert("affected_areas", &data.affected_areas);
    context.insert("symptom_severity", &data.symptom_severity);
    context.insert("quality_of_life", &data.quality_of_life);
    context.insert("previous_treatments", &data.previous_treatments);
    context.insert("current_treatment", &data.current_treatment);
    context.insert("triggers_comorbidities", &data.triggers_comorbidities);
    context.insert("clinical_review", &data.clinical_review);

    context
}
