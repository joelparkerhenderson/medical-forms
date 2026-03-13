use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Step titles used in the progress indicator and page headings.
const STEP_TITLES: &[&str] = &[
    "Personal Information",
    "Capacity Declaration",
    "Circumstances",
    "Treatments Refused - General",
    "Treatments Refused - Life-Sustaining",
    "Exceptions & Conditions",
    "Other Wishes",
    "Lasting Power of Attorney",
    "Healthcare Professional Review",
    "Legal Signatures",
];

/// Total number of steps (always 10, all visible).
pub const TOTAL_STEPS: u32 = 10;

/// Build a Tera context for rendering a step form template.
pub fn build_step_context(data: &AssessmentData, id: Uuid, step: u32) -> Context {
    let mut context = Context::new();

    context.insert("id", &id.to_string());
    context.insert("step", &step);
    context.insert("total_steps", &TOTAL_STEPS);
    context.insert(
        "step_title",
        STEP_TITLES
            .get((step as usize).wrapping_sub(1))
            .unwrap_or(&""),
    );

    // Progress percentage
    let progress = ((step as f64 / TOTAL_STEPS as f64) * 100.0) as u32;
    context.insert("progress", &progress);

    // Navigation
    let prev_step = if step > 1 { Some(step - 1) } else { None };
    let next_step = if step < TOTAL_STEPS {
        Some(step + 1)
    } else {
        None
    };
    context.insert("prev_step", &prev_step);
    context.insert("next_step", &next_step);

    // Insert all data sections so templates can reference them
    context.insert("data", &data);
    context.insert("personal_information", &data.personal_information);
    context.insert("capacity_declaration", &data.capacity_declaration);
    context.insert("circumstances", &data.circumstances);
    context.insert(
        "treatments_refused_general",
        &data.treatments_refused_general,
    );
    context.insert(
        "treatments_refused_life_sustaining",
        &data.treatments_refused_life_sustaining,
    );
    context.insert("exceptions_conditions", &data.exceptions_conditions);
    context.insert("other_wishes", &data.other_wishes);
    context.insert("lasting_power_of_attorney", &data.lasting_power_of_attorney);
    context.insert(
        "healthcare_professional_review",
        &data.healthcare_professional_review,
    );
    context.insert("legal_signatures", &data.legal_signatures);

    context
}
