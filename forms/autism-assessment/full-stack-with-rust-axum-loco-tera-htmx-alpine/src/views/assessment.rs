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
    context.insert("social_communication", &data.social_communication);
    context.insert("restricted_repetitive_behaviours", &data.restricted_repetitive_behaviours);
    context.insert("sensory_processing", &data.sensory_processing);
    context.insert("aq10_screening", &data.aq10_screening);
    context.insert("daily_living_skills", &data.daily_living_skills);
    context.insert("mental_health_comorbidities", &data.mental_health_comorbidities);
    context.insert("support_needs", &data.support_needs);
    context.insert("clinical_review", &data.clinical_review);
    context
}
