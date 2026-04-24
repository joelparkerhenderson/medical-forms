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
    context.insert("allergy_history", &data.allergy_history);
    context.insert("current_allergies", &data.current_allergies);
    context.insert("symptoms_reactions", &data.symptoms_reactions);
    context.insert("environmental_triggers", &data.environmental_triggers);
    context.insert("food_drug_allergies", &data.food_drug_allergies);
    context.insert("testing_results", &data.testing_results);
    context.insert("current_treatment", &data.current_treatment);
    context.insert("emergency_plan", &data.emergency_plan);
    context.insert("review_assessment", &data.review_assessment);
    context
}
