use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Step titles used in the progress indicator and page headings.
const STEP_TITLES: &[&str] = &[
    "Patient Information",
    "Joint Assessment",
    "Morning Stiffness",
    "Disease Activity",
    "Laboratory Markers",
    "Imaging Findings",
    "Functional Status",
    "Medication History",
    "Comorbidities",
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
    context.insert("joint_assessment", &data.joint_assessment);
    context.insert("morning_stiffness", &data.morning_stiffness);
    context.insert("disease_activity", &data.disease_activity);
    context.insert("laboratory_markers", &data.laboratory_markers);
    context.insert("imaging_findings", &data.imaging_findings);
    context.insert("functional_status", &data.functional_status);
    context.insert("medication_history", &data.medication_history);
    context.insert("comorbidities", &data.comorbidities);
    context.insert("clinical_review", &data.clinical_review);

    context
}
