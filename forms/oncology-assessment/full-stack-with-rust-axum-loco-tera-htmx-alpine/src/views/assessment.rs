use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Step titles used in the progress indicator and page headings.
const STEP_TITLES: &[&str] = &[
    "Patient Information",
    "Cancer Diagnosis",
    "Staging & Grading",
    "Treatment History",
    "Current Treatment",
    "Side Effects & Toxicity",
    "Performance Status",
    "Psychosocial Assessment",
    "Palliative Care Needs",
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
    context.insert("cancer_diagnosis", &data.cancer_diagnosis);
    context.insert("staging_grading", &data.staging_grading);
    context.insert("treatment_history", &data.treatment_history);
    context.insert("current_treatment", &data.current_treatment);
    context.insert("side_effects_toxicity", &data.side_effects_toxicity);
    context.insert("performance_status", &data.performance_status);
    context.insert("psychosocial_assessment", &data.psychosocial_assessment);
    context.insert("palliative_care_needs", &data.palliative_care_needs);
    context.insert("clinical_review", &data.clinical_review);

    context
}
