#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::hip_replacement_surgery_evaluations::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub status: String,
    pub assessment_date: Option<Date>,
    pub assessment_time: Option<String>,
    pub site_name: String,
    pub affected_side: String,
    pub symptom_duration_months: Option<i32>,
    pub pain_at_rest_0_10: Option<i32>,
    pub pain_on_activity_0_10: Option<i32>,
    pub night_pain: String,
    pub prior_hip_surgery: String,
    pub prior_hip_surgery_detail: String,
    pub prior_injury_or_dysplasia_history: String,
    pub prior_injury_or_dysplasia_detail: String,
    pub ohs_pain_severity: Option<i32>,
    pub ohs_washing_and_drying: Option<i32>,
    pub ohs_transport: Option<i32>,
    pub ohs_dressing_socks: Option<i32>,
    pub ohs_shopping: Option<i32>,
    pub ohs_walking_pain: Option<i32>,
    pub ohs_limping: Option<i32>,
    pub ohs_kneeling: Option<i32>,
    pub ohs_night_pain: Option<i32>,
    pub ohs_work_interference: Option<i32>,
    pub ohs_giving_way: Option<i32>,
    pub ohs_stairs: Option<i32>,
    pub walking_distance_before_pain: String,
    pub shoes_and_socks_difficulty: String,
    pub walking_aid_use: String,
    pub limp_present: String,
    pub antalgic_gait: String,
    pub trendelenburg_sign: String,
    pub leg_length_discrepancy_as_cm: Option<f64>,
    pub flexion_degrees: Option<i32>,
    pub internal_rotation_degrees: Option<i32>,
    pub external_rotation_degrees: Option<i32>,
    pub abduction_degrees: Option<i32>,
    pub adduction_degrees: Option<i32>,
    pub fixed_flexion_deformity_present: String,
    pub hip_abductor_strength_mrc: Option<i32>,
    pub joint_stability: String,
    pub tenderness_site: String,
    pub weight_bearing_xray_performed: String,
    pub kellgren_lawrence_grade: Option<i32>,
    pub joint_space_narrowing: String,
    pub subchondral_sclerosis_or_cysts_present: String,
    pub mri_performed: String,
    pub mri_findings: String,
    pub ct_performed: String,
    pub ct_indication: String,
    pub physiotherapy_tried: String,
    pub physiotherapy_duration_weeks: Option<i32>,
    pub weight_management_advice_given: String,
    pub steroid_injection_given: String,
    pub steroid_injection_count: Option<i32>,
    pub steroid_injection_response: String,
    pub analgesic_trial_given: String,
    pub analgesic_trial_response: String,
    pub walking_aid_trial: String,
    pub conservative_measures_exhausted: String,
    pub diabetes_controlled: String,
    pub cardiac_disease_present: String,
    pub bleeding_disorder_or_anticoagulant_use: String,
    pub smoking_status: String,
    pub general_fitness_note: String,
    pub full_blood_count_done: String,
    pub renal_function_done: String,
    pub clotting_or_inr_done: String,
    pub ecg_done: String,
    pub mrsa_screen_done: String,
    pub urinalysis_done: String,
    pub risks_and_benefits_discussed: String,
    pub realistic_expectations_discussed: String,
    pub patient_decision_aid_given: String,
    pub interpreter_required: String,
    pub interpreter_language: String,
    pub recommendation: String,
    pub target_list_date: Option<Date>,
    pub responsible_surgeon: String,
    pub additional_notes: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.status = Set(self.status.clone());
      item.assessment_date = Set(self.assessment_date);
      item.assessment_time = Set(self.assessment_time.clone());
      item.site_name = Set(self.site_name.clone());
      item.affected_side = Set(self.affected_side.clone());
      item.symptom_duration_months = Set(self.symptom_duration_months);
      item.pain_at_rest_0_10 = Set(self.pain_at_rest_0_10);
      item.pain_on_activity_0_10 = Set(self.pain_on_activity_0_10);
      item.night_pain = Set(self.night_pain.clone());
      item.prior_hip_surgery = Set(self.prior_hip_surgery.clone());
      item.prior_hip_surgery_detail = Set(self.prior_hip_surgery_detail.clone());
      item.prior_injury_or_dysplasia_history = Set(self.prior_injury_or_dysplasia_history.clone());
      item.prior_injury_or_dysplasia_detail = Set(self.prior_injury_or_dysplasia_detail.clone());
      item.ohs_pain_severity = Set(self.ohs_pain_severity);
      item.ohs_washing_and_drying = Set(self.ohs_washing_and_drying);
      item.ohs_transport = Set(self.ohs_transport);
      item.ohs_dressing_socks = Set(self.ohs_dressing_socks);
      item.ohs_shopping = Set(self.ohs_shopping);
      item.ohs_walking_pain = Set(self.ohs_walking_pain);
      item.ohs_limping = Set(self.ohs_limping);
      item.ohs_kneeling = Set(self.ohs_kneeling);
      item.ohs_night_pain = Set(self.ohs_night_pain);
      item.ohs_work_interference = Set(self.ohs_work_interference);
      item.ohs_giving_way = Set(self.ohs_giving_way);
      item.ohs_stairs = Set(self.ohs_stairs);
      item.walking_distance_before_pain = Set(self.walking_distance_before_pain.clone());
      item.shoes_and_socks_difficulty = Set(self.shoes_and_socks_difficulty.clone());
      item.walking_aid_use = Set(self.walking_aid_use.clone());
      item.limp_present = Set(self.limp_present.clone());
      item.antalgic_gait = Set(self.antalgic_gait.clone());
      item.trendelenburg_sign = Set(self.trendelenburg_sign.clone());
      item.leg_length_discrepancy_as_cm = Set(self.leg_length_discrepancy_as_cm);
      item.flexion_degrees = Set(self.flexion_degrees);
      item.internal_rotation_degrees = Set(self.internal_rotation_degrees);
      item.external_rotation_degrees = Set(self.external_rotation_degrees);
      item.abduction_degrees = Set(self.abduction_degrees);
      item.adduction_degrees = Set(self.adduction_degrees);
      item.fixed_flexion_deformity_present = Set(self.fixed_flexion_deformity_present.clone());
      item.hip_abductor_strength_mrc = Set(self.hip_abductor_strength_mrc);
      item.joint_stability = Set(self.joint_stability.clone());
      item.tenderness_site = Set(self.tenderness_site.clone());
      item.weight_bearing_xray_performed = Set(self.weight_bearing_xray_performed.clone());
      item.kellgren_lawrence_grade = Set(self.kellgren_lawrence_grade);
      item.joint_space_narrowing = Set(self.joint_space_narrowing.clone());
      item.subchondral_sclerosis_or_cysts_present = Set(self.subchondral_sclerosis_or_cysts_present.clone());
      item.mri_performed = Set(self.mri_performed.clone());
      item.mri_findings = Set(self.mri_findings.clone());
      item.ct_performed = Set(self.ct_performed.clone());
      item.ct_indication = Set(self.ct_indication.clone());
      item.physiotherapy_tried = Set(self.physiotherapy_tried.clone());
      item.physiotherapy_duration_weeks = Set(self.physiotherapy_duration_weeks);
      item.weight_management_advice_given = Set(self.weight_management_advice_given.clone());
      item.steroid_injection_given = Set(self.steroid_injection_given.clone());
      item.steroid_injection_count = Set(self.steroid_injection_count);
      item.steroid_injection_response = Set(self.steroid_injection_response.clone());
      item.analgesic_trial_given = Set(self.analgesic_trial_given.clone());
      item.analgesic_trial_response = Set(self.analgesic_trial_response.clone());
      item.walking_aid_trial = Set(self.walking_aid_trial.clone());
      item.conservative_measures_exhausted = Set(self.conservative_measures_exhausted.clone());
      item.diabetes_controlled = Set(self.diabetes_controlled.clone());
      item.cardiac_disease_present = Set(self.cardiac_disease_present.clone());
      item.bleeding_disorder_or_anticoagulant_use = Set(self.bleeding_disorder_or_anticoagulant_use.clone());
      item.smoking_status = Set(self.smoking_status.clone());
      item.general_fitness_note = Set(self.general_fitness_note.clone());
      item.full_blood_count_done = Set(self.full_blood_count_done.clone());
      item.renal_function_done = Set(self.renal_function_done.clone());
      item.clotting_or_inr_done = Set(self.clotting_or_inr_done.clone());
      item.ecg_done = Set(self.ecg_done.clone());
      item.mrsa_screen_done = Set(self.mrsa_screen_done.clone());
      item.urinalysis_done = Set(self.urinalysis_done.clone());
      item.risks_and_benefits_discussed = Set(self.risks_and_benefits_discussed.clone());
      item.realistic_expectations_discussed = Set(self.realistic_expectations_discussed.clone());
      item.patient_decision_aid_given = Set(self.patient_decision_aid_given.clone());
      item.interpreter_required = Set(self.interpreter_required.clone());
      item.interpreter_language = Set(self.interpreter_language.clone());
      item.recommendation = Set(self.recommendation.clone());
      item.target_list_date = Set(self.target_list_date);
      item.responsible_surgeon = Set(self.responsible_surgeon.clone());
      item.additional_notes = Set(self.additional_notes.clone());
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

#[debug_handler]
pub async fn update(
    Path(id): Path<i64>,
    State(ctx): State<AppContext>,
    Json(params): Json<Params>,
) -> Result<Response> {
    let item = load_item(&ctx, id).await?;
    let mut item = item.into_active_model();
    params.update(&mut item);
    let item = item.update(&ctx.db).await?;
    format::json(item)
}

#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/hip_replacement_surgery_evaluations/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
