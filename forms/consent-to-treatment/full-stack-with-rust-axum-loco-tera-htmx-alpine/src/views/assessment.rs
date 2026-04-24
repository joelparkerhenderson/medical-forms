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
    context.insert("procedure_details", &data.procedure_details);
    context.insert("risks_and_benefits", &data.risks_and_benefits);
    context.insert("alternatives", &data.alternatives);
    context.insert("capacity_assessment", &data.capacity_assessment);
    context.insert("patient_understanding", &data.patient_understanding);
    context.insert("additional_considerations", &data.additional_considerations);
    context.insert("interpreter_requirements", &data.interpreter_requirements);
    context.insert("signatures", &data.signatures);
    context.insert("clinical_verification", &data.clinical_verification);
    context
}
