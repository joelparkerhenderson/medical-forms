use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

const STEP_TITLES: &[&str] = &[
    "Patient Demographics",
    "Diabetes History",
    "Cardiovascular History",
    "Blood Pressure",
    "Lipid Profile",
    "Renal Function",
    "Lifestyle Factors",
    "Current Medications",
    "Complications Screening",
    "Risk Assessment Summary",
];

pub const TOTAL_STEPS: u32 = 10;

pub fn build_step_context(data: &AssessmentData, id: Uuid, step: u32) -> Context {
    let mut context = Context::new();
    context.insert("id", &id.to_string());
    context.insert("step", &step);
    context.insert("total_steps", &TOTAL_STEPS);
    context.insert("step_title", STEP_TITLES.get((step as usize).wrapping_sub(1)).unwrap_or(&""));
    let progress = ((step as f64 / TOTAL_STEPS as f64) * 100.0) as u32;
    context.insert("progress", &progress);
    let prev_step = if step > 1 { Some(step - 1) } else { None };
    let next_step = if step < TOTAL_STEPS { Some(step + 1) } else { None };
    context.insert("prev_step", &prev_step);
    context.insert("next_step", &next_step);
    context.insert("data", &data);
    context.insert("patient_demographics", &data.patient_demographics);
    context.insert("diabetes_history", &data.diabetes_history);
    context.insert("cardiovascular_history", &data.cardiovascular_history);
    context.insert("blood_pressure", &data.blood_pressure);
    context.insert("lipid_profile", &data.lipid_profile);
    context.insert("renal_function", &data.renal_function);
    context.insert("lifestyle_factors", &data.lifestyle_factors);
    context.insert("current_medications", &data.current_medications);
    context.insert("complications_screening", &data.complications_screening);
    context.insert("risk_assessment_summary", &data.risk_assessment_summary);
    context
}
