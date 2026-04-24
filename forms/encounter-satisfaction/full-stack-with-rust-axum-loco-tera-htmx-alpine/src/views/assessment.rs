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
    context.insert("visit_information", &data.visit_information);
    context.insert("wait_time_access", &data.wait_time_access);
    context.insert("communication", &data.communication);
    context.insert("care_quality", &data.care_quality);
    context.insert("staff_interaction", &data.staff_interaction);
    context.insert("environment", &data.environment);
    context.insert("medication_treatment", &data.medication_treatment);
    context.insert("discharge_follow_up", &data.discharge_follow_up);
    context.insert("overall_experience", &data.overall_experience);
    context.insert("demographics_comments", &data.demographics_comments);
    context
}
