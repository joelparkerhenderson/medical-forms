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
    context.insert("personal_information", &data.personal_information);
    context.insert("capacity_declaration", &data.capacity_declaration);
    context.insert("circumstances", &data.circumstances);
    context.insert("exceptions_conditions", &data.exceptions_conditions);
    context.insert("other_wishes", &data.other_wishes);
    context.insert("lasting_power_of_attorney", &data.lasting_power_of_attorney);
    context.insert("legal_signatures", &data.legal_signatures);
    context
}
