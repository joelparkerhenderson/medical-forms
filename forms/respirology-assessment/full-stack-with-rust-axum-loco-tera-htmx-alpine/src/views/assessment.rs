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
    context.insert("respiratory_symptoms", &data.respiratory_symptoms);
    context.insert("cough_assessment", &data.cough_assessment);
    context.insert("dyspnoea_assessment", &data.dyspnoea_assessment);
    context.insert("chest_examination", &data.chest_examination);
    context.insert("spirometry_results", &data.spirometry_results);
    context.insert("oxygen_assessment", &data.oxygen_assessment);
    context.insert("respiratory_infections", &data.respiratory_infections);
    context.insert("inhaler_medications", &data.inhaler_medications);
    context.insert("clinical_review", &data.clinical_review);
    context
}
