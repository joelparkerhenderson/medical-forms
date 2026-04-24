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
    context.insert("obstetric_history", &data.obstetric_history);
    context.insert("current_pregnancy", &data.current_pregnancy);
    context.insert("antenatal_screening", &data.antenatal_screening);
    context.insert("physical_examination", &data.physical_examination);
    context.insert("blood_tests", &data.blood_tests);
    context.insert("ultrasound_findings", &data.ultrasound_findings);
    context.insert("mental_health_wellbeing", &data.mental_health_wellbeing);
    context.insert("birth_planning", &data.birth_planning);
    context.insert("clinical_review", &data.clinical_review);
    context
}
