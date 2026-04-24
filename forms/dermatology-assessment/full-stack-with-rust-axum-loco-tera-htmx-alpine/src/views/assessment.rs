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
