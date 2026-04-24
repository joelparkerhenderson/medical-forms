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
    context.insert("blood_count_analysis", &data.blood_count_analysis);
    context.insert("coagulation_studies", &data.coagulation_studies);
    context.insert("peripheral_blood_film", &data.peripheral_blood_film);
    context.insert("iron_studies", &data.iron_studies);
    context.insert("hemoglobinopathy_screening", &data.hemoglobinopathy_screening);
    context.insert("bone_marrow_assessment", &data.bone_marrow_assessment);
    context.insert("transfusion_history", &data.transfusion_history);
    context.insert("treatment_medications", &data.treatment_medications);
    context.insert("clinical_review", &data.clinical_review);
    context
}
