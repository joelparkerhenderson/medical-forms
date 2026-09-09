#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::ambulatory_blood_pressure_test_results::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub originating_request_reference: String,
    pub monitoring_type: String,
    pub report_status: String,
    pub performed_date: Option<Date>,
    pub reported_date: Option<Date>,
    pub valid_readings_percent: Option<f64>,
    pub recording_adequate: bool,
    pub clinical_history: String,
    pub daytime_average_systolic: Option<f64>,
    pub daytime_average_diastolic: Option<f64>,
    pub nighttime_average_systolic: Option<f64>,
    pub nighttime_average_diastolic: Option<f64>,
    pub twenty_four_hour_average_systolic: Option<f64>,
    pub twenty_four_hour_average_diastolic: Option<f64>,
    pub nocturnal_dip_percent: Option<f64>,
    pub dipper_status: String,
    pub hypertension_confirmed: bool,
    pub white_coat_effect: bool,
    pub masked_hypertension: bool,
    pub severe_hypertension: bool,
    pub nocturnal_hypertension: bool,
    pub normal_study: bool,
    pub findings_narrative: String,
    pub comparison_with_previous: String,
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
      item.monitoring_type = Set(self.monitoring_type.clone());
      item.report_status = Set(self.report_status.clone());
      item.performed_date = Set(self.performed_date);
      item.reported_date = Set(self.reported_date);
      item.valid_readings_percent = Set(self.valid_readings_percent);
      item.recording_adequate = Set(self.recording_adequate);
      item.clinical_history = Set(self.clinical_history.clone());
      item.daytime_average_systolic = Set(self.daytime_average_systolic);
      item.daytime_average_diastolic = Set(self.daytime_average_diastolic);
      item.nighttime_average_systolic = Set(self.nighttime_average_systolic);
      item.nighttime_average_diastolic = Set(self.nighttime_average_diastolic);
      item.twenty_four_hour_average_systolic = Set(self.twenty_four_hour_average_systolic);
      item.twenty_four_hour_average_diastolic = Set(self.twenty_four_hour_average_diastolic);
      item.nocturnal_dip_percent = Set(self.nocturnal_dip_percent);
      item.dipper_status = Set(self.dipper_status.clone());
      item.hypertension_confirmed = Set(self.hypertension_confirmed);
      item.white_coat_effect = Set(self.white_coat_effect);
      item.masked_hypertension = Set(self.masked_hypertension);
      item.severe_hypertension = Set(self.severe_hypertension);
      item.nocturnal_hypertension = Set(self.nocturnal_hypertension);
      item.normal_study = Set(self.normal_study);
      item.findings_narrative = Set(self.findings_narrative.clone());
      item.comparison_with_previous = Set(self.comparison_with_previous.clone());
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
        .prefix("api/ambulatory_blood_pressure_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
