use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Total number of steps (always 10, all visible).
pub const TOTAL_STEPS: u32 = 10;

/// Build a Tera context for rendering the single-page assessment form.
/// All section partials share the same context.
pub fn build_assessment_context(data: &AssessmentData, id: Uuid) -> Context {
    let mut context = Context::new();
    context.insert("id", &id.to_string());
    context.insert("total_steps", &TOTAL_STEPS);
    context.insert("data", data);
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
