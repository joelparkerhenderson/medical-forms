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
    context.insert("demographics_ethnicity", &data.demographics_ethnicity);
    context.insert("blood_pressure", &data.blood_pressure);
    context.insert("cholesterol", &data.cholesterol);
    context.insert("medical_conditions", &data.medical_conditions);
    context.insert("family_history", &data.family_history);
    context.insert("smoking_alcohol", &data.smoking_alcohol);
    context.insert("physical_activity_diet", &data.physical_activity_diet);
    context.insert("body_measurements", &data.body_measurements);
    context.insert("review_calculate", &data.review_calculate);

    context
}
