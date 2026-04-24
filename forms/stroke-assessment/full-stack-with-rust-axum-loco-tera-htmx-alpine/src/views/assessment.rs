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
    context.insert("event_details", &data.event_details);
    context.insert("nihss_assessment", &data.nihss_assessment);
    context.insert("stroke_classification", &data.stroke_classification);
    context.insert("risk_factors", &data.risk_factors);
    context.insert("investigations", &data.investigations);
    context.insert("acute_treatment", &data.acute_treatment);
    context.insert("functional_assessment", &data.functional_assessment);
    context.insert("secondary_prevention", &data.secondary_prevention);
    context.insert("clinical_review", &data.clinical_review);
    context
}
