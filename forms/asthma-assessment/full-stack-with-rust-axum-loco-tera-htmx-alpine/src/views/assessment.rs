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
