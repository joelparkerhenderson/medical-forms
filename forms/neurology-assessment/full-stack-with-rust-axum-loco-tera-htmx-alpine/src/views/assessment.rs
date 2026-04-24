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
    context.insert("neurological_history", &data.neurological_history);
    context.insert("headache_assessment", &data.headache_assessment);
    context.insert("cranial_nerve_examination", &data.cranial_nerve_examination);
    context.insert("motor_assessment", &data.motor_assessment);
    context.insert("sensory_assessment", &data.sensory_assessment);
    context.insert("reflexes_coordination", &data.reflexes_coordination);
    context.insert("cognitive_screening", &data.cognitive_screening);
    context.insert("investigations", &data.investigations);
    context.insert("clinical_review", &data.clinical_review);
    context
}
