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
    context.insert("personal_values", &data.personal_values);
    context.insert("care_preferences", &data.care_preferences);
    context.insert("communication_preferences", &data.communication_preferences);
    context.insert("daily_living_preferences", &data.daily_living_preferences);
    context.insert("spiritual_cultural", &data.spiritual_cultural);
    context.insert("nominated_persons", &data.nominated_persons);
    context.insert("end_of_life_preferences", &data.end_of_life_preferences);
    context.insert("healthcare_professional_review", &data.healthcare_professional_review);
    context.insert("signatures_verification", &data.signatures_verification);
    context
}
