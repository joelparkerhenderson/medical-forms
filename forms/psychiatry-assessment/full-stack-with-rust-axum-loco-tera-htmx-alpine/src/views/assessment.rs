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
    context.insert("presenting_complaint", &data.presenting_complaint);
    context.insert("psychiatric_history", &data.psychiatric_history);
    context.insert("mental_state_examination", &data.mental_state_examination);
    context.insert("risk_assessment", &data.risk_assessment);
    context.insert("substance_use", &data.substance_use);
    context.insert("social_functional", &data.social_functional);
    context.insert("family_history", &data.family_history);
    context.insert("current_treatment", &data.current_treatment);
    context.insert("clinical_review", &data.clinical_review);
    context
}
