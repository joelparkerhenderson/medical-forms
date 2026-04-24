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
    context.insert("injury_history", &data.injury_history);
    context.insert("pain_assessment", &data.pain_assessment);
    context.insert("joint_examination", &data.joint_examination);
    context.insert("muscle_assessment", &data.muscle_assessment);
    context.insert("spinal_assessment", &data.spinal_assessment);
    context.insert("imaging_investigations", &data.imaging_investigations);
    context.insert("functional_status", &data.functional_status);
    context.insert("surgical_considerations", &data.surgical_considerations);
    context.insert("clinical_review", &data.clinical_review);
    context
}
