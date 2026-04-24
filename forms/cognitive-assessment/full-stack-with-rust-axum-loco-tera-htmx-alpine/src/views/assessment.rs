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
    context.insert("cognitive_history", &data.cognitive_history);
    context.insert("orientation", &data.orientation);
    context.insert("registration_attention", &data.registration_attention);
    context.insert("recall", &data.recall);
    context.insert("language", &data.language);
    context.insert("visuospatial", &data.visuospatial);
    context.insert("executive_function", &data.executive_function);
    context.insert("functional_assessment", &data.functional_assessment);
    context.insert("clinical_review", &data.clinical_review);
    context
}
