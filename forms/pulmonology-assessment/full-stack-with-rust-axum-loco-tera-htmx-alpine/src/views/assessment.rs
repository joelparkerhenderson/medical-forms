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
    context.insert("respiratory_history", &data.respiratory_history);
    context.insert("symptom_assessment", &data.symptom_assessment);
    context.insert("smoking_exposure", &data.smoking_exposure);
    context.insert("pulmonary_function_tests", &data.pulmonary_function_tests);
    context.insert("chest_imaging", &data.chest_imaging);
    context.insert("arterial_blood_gases", &data.arterial_blood_gases);
    context.insert("sleep_breathing", &data.sleep_breathing);
    context.insert("current_treatment", &data.current_treatment);
    context.insert("clinical_review", &data.clinical_review);
    context
}
