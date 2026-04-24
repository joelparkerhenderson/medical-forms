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
    context.insert("immunization_history", &data.immunization_history);
    context.insert("childhood_vaccinations", &data.childhood_vaccinations);
    context.insert("adult_vaccinations", &data.adult_vaccinations);
    context.insert("travel_vaccinations", &data.travel_vaccinations);
    context.insert("occupational_vaccinations", &data.occupational_vaccinations);
    context.insert("contraindications_allergies", &data.contraindications_allergies);
    context.insert("consent_information", &data.consent_information);
    context.insert("administration_record", &data.administration_record);
    context.insert("clinical_review", &data.clinical_review);
    context
}
