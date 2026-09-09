#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::cardiac_stress_test_results::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub originating_request_reference: String,
    pub report_status: String,
    pub performed_date: Option<Date>,
    pub reported_date: Option<Date>,
    pub test_type: String,
    pub protocol: String,
    pub clinical_history: String,
    pub comparison_with_previous: String,
    pub maximum_heart_rate_bpm: Option<i32>,
    pub percent_predicted_heart_rate: Option<f64>,
    pub exercise_duration_minutes: Option<f64>,
    pub mets_achieved: Option<f64>,
    pub peak_blood_pressure: String,
    pub blood_pressure_response: String,
    pub ischaemic_st_changes: bool,
    pub chest_pain_induced: bool,
    pub arrhythmia_induced: bool,
    pub terminated_early: bool,
    pub test_positive: bool,
    pub test_negative: bool,
    pub test_inconclusive: bool,
    pub reason_for_termination: String,
    pub duke_treadmill_score: Option<f64>,
    pub impression: String,
    pub reporting_category: String,
    pub recommended_follow_up: String,
    pub critical_result_communicated: bool,
    pub reported_to: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.originating_request_reference = Set(self.originating_request_reference.clone());
      item.report_status = Set(self.report_status.clone());
      item.performed_date = Set(self.performed_date);
      item.reported_date = Set(self.reported_date);
      item.test_type = Set(self.test_type.clone());
      item.protocol = Set(self.protocol.clone());
      item.clinical_history = Set(self.clinical_history.clone());
      item.comparison_with_previous = Set(self.comparison_with_previous.clone());
      item.maximum_heart_rate_bpm = Set(self.maximum_heart_rate_bpm);
      item.percent_predicted_heart_rate = Set(self.percent_predicted_heart_rate);
      item.exercise_duration_minutes = Set(self.exercise_duration_minutes);
      item.mets_achieved = Set(self.mets_achieved);
      item.peak_blood_pressure = Set(self.peak_blood_pressure.clone());
      item.blood_pressure_response = Set(self.blood_pressure_response.clone());
      item.ischaemic_st_changes = Set(self.ischaemic_st_changes);
      item.chest_pain_induced = Set(self.chest_pain_induced);
      item.arrhythmia_induced = Set(self.arrhythmia_induced);
      item.terminated_early = Set(self.terminated_early);
      item.test_positive = Set(self.test_positive);
      item.test_negative = Set(self.test_negative);
      item.test_inconclusive = Set(self.test_inconclusive);
      item.reason_for_termination = Set(self.reason_for_termination.clone());
      item.duke_treadmill_score = Set(self.duke_treadmill_score);
      item.impression = Set(self.impression.clone());
      item.reporting_category = Set(self.reporting_category.clone());
      item.recommended_follow_up = Set(self.recommended_follow_up.clone());
      item.critical_result_communicated = Set(self.critical_result_communicated);
      item.reported_to = Set(self.reported_to.clone());
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
        .prefix("api/cardiac_stress_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
