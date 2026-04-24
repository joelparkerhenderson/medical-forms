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
    context.insert("requesting_party", &data.requesting_party);
    context.insert("records_specification", &data.records_specification);
    context.insert("purpose_of_release", &data.purpose_of_release);
    context.insert("authorization_scope", &data.authorization_scope);
    context.insert("sensitive_information", &data.sensitive_information);
    context.insert("duration_expiry", &data.duration_expiry);
    context.insert("verification_identity", &data.verification_identity);
    context.insert("signatures_consent", &data.signatures_consent);
    context.insert("clinical_review", &data.clinical_review);
    context
}
