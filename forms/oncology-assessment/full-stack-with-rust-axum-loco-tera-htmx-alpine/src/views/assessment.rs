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
