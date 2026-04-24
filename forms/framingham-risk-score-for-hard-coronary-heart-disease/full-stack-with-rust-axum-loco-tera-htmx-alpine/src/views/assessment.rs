use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Build a Tera context for rendering the single-page assessment template.
pub fn build_assessment_context(data: &AssessmentData, id: Uuid) -> Context {
    let mut context = Context::new();

    context.insert("id", &id.to_string());

    // Insert all data sections so templates can reference them
    context.insert("data", &data);
    context.insert("patient_information", &data.patient_information);
    context.insert("demographics", &data.demographics);
    context.insert("smoking_history", &data.smoking_history);
    context.insert("blood_pressure", &data.blood_pressure);
    context.insert("cholesterol", &data.cholesterol);
    context.insert("medical_history", &data.medical_history);
    context.insert("family_history", &data.family_history);
    context.insert("lifestyle_factors", &data.lifestyle_factors);
    context.insert("current_medications", &data.current_medications);
    context.insert("review_calculate", &data.review_calculate);

    context
}
