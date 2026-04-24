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
    context.insert("occupational_profile", &data.occupational_profile);
    context.insert("daily_living_activities", &data.daily_living_activities);
    context.insert("instrumental_activities", &data.instrumental_activities);
    context.insert("cognitive_perceptual", &data.cognitive_perceptual);
    context.insert("motor_sensory", &data.motor_sensory);
    context.insert("home_environment", &data.home_environment);
    context.insert("work_leisure", &data.work_leisure);
    context.insert("goals_priorities", &data.goals_priorities);
    context.insert("clinical_review", &data.clinical_review);
    context
}
