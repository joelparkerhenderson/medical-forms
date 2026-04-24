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
    context.insert("patient_parent_information", &data.patient_parent_information);
    context.insert("birth_neonatal_history", &data.birth_neonatal_history);
    context.insert("growth_development", &data.growth_development);
    context.insert("immunization_status", &data.immunization_status);
    context.insert("feeding_nutrition", &data.feeding_nutrition);
    context.insert("developmental_milestones", &data.developmental_milestones);
    context.insert("behavioral_assessment", &data.behavioral_assessment);
    context.insert("family_social_history", &data.family_social_history);
    context.insert("systems_review", &data.systems_review);
    context.insert("clinical_review", &data.clinical_review);
    context
}
