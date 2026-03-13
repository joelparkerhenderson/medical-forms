use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Step titles used in the progress indicator and page headings.
const STEP_TITLES: &[&str] = &[
    "Patient Information",
    "Requesting Party",
    "Records Specification",
    "Purpose of Release",
    "Authorization Scope",
    "Sensitive Information",
    "Duration & Expiry",
    "Verification & Identity",
    "Signatures & Consent",
    "Clinical Review",
];

/// Total number of steps (always 10, all visible).
pub const TOTAL_STEPS: u32 = 10;

/// Build a Tera context for rendering a step form template.
pub fn build_step_context(data: &AssessmentData, id: Uuid, step: u32) -> Context {
    let mut context = Context::new();

    context.insert("id", &id.to_string());
    context.insert("step", &step);
    context.insert("total_steps", &TOTAL_STEPS);
    context.insert("step_title", STEP_TITLES.get((step as usize).wrapping_sub(1)).unwrap_or(&""));

    // Progress percentage
    let progress = ((step as f64 / TOTAL_STEPS as f64) * 100.0) as u32;
    context.insert("progress", &progress);

    // Navigation
    let prev_step = if step > 1 { Some(step - 1) } else { None };
    let next_step = if step < TOTAL_STEPS { Some(step + 1) } else { None };
    context.insert("prev_step", &prev_step);
    context.insert("next_step", &next_step);

    // Insert all data sections so templates can reference them
    context.insert("data", &data);
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
