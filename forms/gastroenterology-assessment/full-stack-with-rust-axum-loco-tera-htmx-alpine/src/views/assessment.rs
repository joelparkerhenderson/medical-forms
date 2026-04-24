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
    context.insert("gi_history", &data.gi_history);
    context.insert("upper_gi_symptoms", &data.upper_gi_symptoms);
    context.insert("lower_gi_symptoms", &data.lower_gi_symptoms);
    context.insert("alarm_features", &data.alarm_features);
    context.insert("nutritional_assessment", &data.nutritional_assessment);
    context.insert("liver_assessment", &data.liver_assessment);
    context.insert("investigations", &data.investigations);
    context.insert("current_treatment", &data.current_treatment);
    context.insert("clinical_review", &data.clinical_review);
    context
}
