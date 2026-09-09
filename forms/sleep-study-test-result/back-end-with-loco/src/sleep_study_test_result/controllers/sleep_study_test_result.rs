#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::sleep_study_test_results::{ActiveModel, Entity, Model};

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
    pub study_type: String,
    pub study_adequacy: String,
    pub clinical_history: String,
    pub comparison_with_previous: String,
    pub total_recording_time_hours: Option<f64>,
    pub total_sleep_time_hours: Option<f64>,
    pub apnoea_hypopnoea_index: Option<f64>,
    pub oxygen_desaturation_index: Option<f64>,
    pub minimum_spo2_percent: Option<f64>,
    pub time_below_90_percent_spo2: Option<f64>,
    pub mean_heart_rate_bpm: Option<i32>,
    pub osa_severity: String,
    pub obstructive_sleep_apnoea: bool,
    pub central_sleep_apnoea: bool,
    pub periodic_limb_movements: bool,
    pub nocturnal_hypoventilation: bool,
    pub significant_desaturation: bool,
    pub normal_study: bool,
    pub findings_narrative: String,
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
      item.study_type = Set(self.study_type.clone());
      item.study_adequacy = Set(self.study_adequacy.clone());
      item.clinical_history = Set(self.clinical_history.clone());
      item.comparison_with_previous = Set(self.comparison_with_previous.clone());
      item.total_recording_time_hours = Set(self.total_recording_time_hours);
      item.total_sleep_time_hours = Set(self.total_sleep_time_hours);
      item.apnoea_hypopnoea_index = Set(self.apnoea_hypopnoea_index);
      item.oxygen_desaturation_index = Set(self.oxygen_desaturation_index);
      item.minimum_spo2_percent = Set(self.minimum_spo2_percent);
      item.time_below_90_percent_spo2 = Set(self.time_below_90_percent_spo2);
      item.mean_heart_rate_bpm = Set(self.mean_heart_rate_bpm);
      item.osa_severity = Set(self.osa_severity.clone());
      item.obstructive_sleep_apnoea = Set(self.obstructive_sleep_apnoea);
      item.central_sleep_apnoea = Set(self.central_sleep_apnoea);
      item.periodic_limb_movements = Set(self.periodic_limb_movements);
      item.nocturnal_hypoventilation = Set(self.nocturnal_hypoventilation);
      item.significant_desaturation = Set(self.significant_desaturation);
      item.normal_study = Set(self.normal_study);
      item.findings_narrative = Set(self.findings_narrative.clone());
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
        .prefix("api/sleep_study_test_results/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
