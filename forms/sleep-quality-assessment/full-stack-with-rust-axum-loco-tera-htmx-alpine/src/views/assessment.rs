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
    context.insert("sleep_habits", &data.sleep_habits);
    context.insert("sleep_quality_psqi", &data.sleep_quality_psqi);
    context.insert("daytime_sleepiness", &data.daytime_sleepiness);
    context.insert("sleep_disturbances", &data.sleep_disturbances);
    context.insert("sleep_apnoea_screening", &data.sleep_apnoea_screening);
    context.insert("sleep_hygiene", &data.sleep_hygiene);
    context.insert("medical_medications", &data.medical_medications);
    context.insert("impact_assessment", &data.impact_assessment);
    context.insert("clinical_review", &data.clinical_review);
    context
}
