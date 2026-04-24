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
    context.insert("symptom_history", &data.symptom_history);
    context.insert("skin_manifestations", &data.skin_manifestations);
    context.insert("gastrointestinal_symptoms", &data.gastrointestinal_symptoms);
    context.insert("cardiovascular_neurological", &data.cardiovascular_neurological);
    context.insert("respiratory_symptoms", &data.respiratory_symptoms);
    context.insert("laboratory_studies", &data.laboratory_studies);
    context.insert("trigger_identification", &data.trigger_identification);
    context.insert("current_treatment", &data.current_treatment);
    context.insert("clinical_review", &data.clinical_review);
    context
}
