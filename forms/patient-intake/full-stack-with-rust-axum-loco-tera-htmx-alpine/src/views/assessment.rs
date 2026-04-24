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
    context.insert("personal_information", &data.personal_information);
    context.insert("insurance_and_id", &data.insurance_and_id);
    context.insert("reason_for_visit", &data.reason_for_visit);
    context.insert("medical_history", &data.medical_history);
    context.insert("medications", &data.medications);
    context.insert("allergies", &data.allergies);
    context.insert("family_history", &data.family_history);
    context.insert("social_history", &data.social_history);
    context.insert("review_of_systems", &data.review_of_systems);
    context.insert("consent_and_preferences", &data.consent_and_preferences);
    context
}
