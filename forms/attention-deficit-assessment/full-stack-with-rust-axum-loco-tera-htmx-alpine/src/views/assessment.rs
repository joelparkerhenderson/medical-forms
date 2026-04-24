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
    context.insert("developmental_history", &data.developmental_history);
    context.insert("inattention_symptoms", &data.inattention_symptoms);
    context.insert("hyperactivity_impulsivity", &data.hyperactivity_impulsivity);
    context.insert("asrs_screener", &data.asrs_screener);
    context.insert("functional_impact", &data.functional_impact);
    context.insert("comorbidities", &data.comorbidities);
    context.insert("previous_assessment", &data.previous_assessment);
    context.insert("current_management", &data.current_management);
    context.insert("clinical_review", &data.clinical_review);
    context
}
